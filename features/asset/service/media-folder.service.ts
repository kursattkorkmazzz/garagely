import { GetGaragelyDatabase } from "@/db/db";
import { AssetEntity } from "@/features/asset/entity/asset.entity";
import { ImageMetadataEntity } from "@/features/asset/entity/metadata/image-metadata.entity";
import { MediaFolderEntity } from "@/features/asset/entity/media-folder.entity";
import { MediaFolderErrors } from "@/features/asset/errors/media-folder.errors";
import { ExpoFileSystemStorage } from "@/features/asset/storage/expo-fs-storage";
import { StorageAsset } from "@/features/asset/model/storage-asset";
import { AppError } from "@/shared/errors/app-error";
import { IsNull } from "typeorm";

export type CreateFolderDto = {
  name: string;
  parentId?: string | null;
};

export type RenameFolderDto = {
  name: string;
};

export type CascadeStats = {
  folderCount: number;
  assetCount: number;
};

export class MediaFolderService {
  private static async repo() {
    const db = await GetGaragelyDatabase();
    return db.getRepository(MediaFolderEntity);
  }

  // ─── Okuma ────────────────────────────────────────────────────────

  /** Root klasörler (parentId IS NULL), isme göre sıralı */
  static async getRootFolders(): Promise<MediaFolderEntity[]> {
    return (await this.repo()).find({
      where: { parentId: IsNull() },
      order: { name: "ASC" },
    });
  }

  /** Belirli bir klasörün doğrudan alt klasörleri */
  static async getChildren(parentId: string): Promise<MediaFolderEntity[]> {
    return (await this.repo()).find({
      where: { parentId },
      order: { name: "ASC" },
    });
  }

  /**
   * Breadcrumb için kök'e kadar ancestor zinciri.
   * Dönen dizi [root, ..., leaf] sırasındadır.
   */
  static async getFolderPath(folderId: string): Promise<MediaFolderEntity[]> {
    const path: MediaFolderEntity[] = [];
    const repo = await this.repo();
    let current = await repo.findOneBy({ id: folderId });
    while (current) {
      path.unshift(current);
      if (!current.parentId) break;
      current = await repo.findOneBy({ id: current.parentId });
    }
    return path;
  }

  /** Tekil klasör — bulunamazsa null döner */
  static async getById(id: string): Promise<MediaFolderEntity | null> {
    return (await this.repo()).findOneBy({ id });
  }

  // ─── Yazma ────────────────────────────────────────────────────────

  /** Yeni klasör oluştur */
  static async create(dto: CreateFolderDto): Promise<MediaFolderEntity> {
    MediaFolderService.validateName(dto.name);
    const repo = await this.repo();

    // Aynı parent altında isim çakışma kontrolü
    const sibling = await repo.findOne({
      where: {
        parentId: dto.parentId ?? IsNull(),
        name: dto.name.trim(),
      },
    });
    if (sibling) {
      throw AppError.createAppError(MediaFolderErrors.NAME_ALREADY_EXISTS);
    }

    return repo.save(
      repo.create({ name: dto.name.trim(), parentId: dto.parentId ?? null }),
    );
  }

  /** Klasör adını değiştir */
  static async rename(id: string, dto: RenameFolderDto): Promise<MediaFolderEntity> {
    MediaFolderService.validateName(dto.name);
    const repo = await this.repo();
    const folder = await repo.findOneByOrFail({ id });

    // Aynı kardeşler arasında isim çakışma kontrolü
    const sibling = await repo.findOne({
      where: {
        parentId: folder.parentId ?? IsNull(),
        name: dto.name.trim(),
      },
    });
    if (sibling && sibling.id !== id) {
      throw AppError.createAppError(MediaFolderErrors.NAME_ALREADY_EXISTS);
    }

    await repo.update(id, { name: dto.name.trim() });
    return repo.findOneByOrFail({ id });
  }

  /**
   * Klasörü yeni bir parent'a taşı.
   * Döngüsel referans ve kendi kendine taşıma engellenir.
   */
  static async moveFolder(
    folderId: string,
    newParentId: string | null,
  ): Promise<MediaFolderEntity> {
    if (newParentId !== null) {
      if (newParentId === folderId) {
        throw AppError.createAppError(MediaFolderErrors.CIRCULAR_REFERENCE);
      }
      const isDescendant = await MediaFolderService.isDescendant(
        newParentId,
        folderId,
      );
      if (isDescendant) {
        throw AppError.createAppError(MediaFolderErrors.CIRCULAR_REFERENCE);
      }
    }

    const repo = await this.repo();
    await repo.update(folderId, { parentId: newParentId });
    return repo.findOneByOrFail({ id: folderId });
  }

  /**
   * Cascade silme için istatistik.
   * Klasörün kendisi dahil tüm alt ağaçtaki klasör ve asset sayısını döner.
   */
  static async getCascadeStats(folderId: string): Promise<CascadeStats> {
    const descendantIds = await MediaFolderService.collectDescendantIds(folderId);
    const allIds = [folderId, ...descendantIds];

    const db = await GetGaragelyDatabase();
    const assetCount = await db
      .getRepository(AssetEntity)
      .createQueryBuilder("a")
      .where("a.folderId IN (:...ids)", { ids: allIds })
      .getCount();

    return {
      folderCount: descendantIds.length, // alt klasörler (silinecek klasörün kendisi hariç)
      assetCount,
    };
  }

  /**
   * Klasörü ve tüm alt ağacını siler.
   * Asset dosyaları fiziksel olarak silinir, DB kayıtları (image_metadata dahil) temizlenir.
   * Araç entity referansları onDelete: "SET NULL" ile otomatik sıfırlanır.
   */
  static async deleteCascade(folderId: string): Promise<void> {
    const descendantIds = await MediaFolderService.collectDescendantIds(folderId);
    const allFolderIds = [folderId, ...descendantIds];

    const db = await GetGaragelyDatabase();
    const assetRepo = db.getRepository(AssetEntity);
    const imgMetaRepo = db.getRepository(ImageMetadataEntity);
    const folderRepo = db.getRepository(MediaFolderEntity);

    // 1. Tüm alt ağaçtaki asset'leri bul
    const assets = await assetRepo
      .createQueryBuilder("a")
      .where("a.folderId IN (:...ids)", { ids: allFolderIds })
      .getMany();

    // 2. Fiziksel dosyaları sil
    for (const asset of assets) {
      try {
        const storageAsset: StorageAsset = {
          fullPath: asset.fullPath,
          basePath: asset.basePath,
          baseName: asset.baseName,
          fullName: asset.fullName,
          extension: asset.extension,
          mimeType: asset.mimeType,
          sizeBytes: asset.sizeBytes,
          isTemp: false,
        };
        await ExpoFileSystemStorage.deleteFile(storageAsset);
      } catch {
        // Dosya yoksa sessizce geç
      }
    }

    // 3. ImageMetadata kayıtlarını sil
    const assetIds = assets.map((a) => a.id);
    if (assetIds.length > 0) {
      await imgMetaRepo
        .createQueryBuilder()
        .delete()
        .where("assetId IN (:...ids)", { ids: assetIds })
        .execute();

      // 4. Asset DB kayıtlarını sil
      await assetRepo
        .createQueryBuilder()
        .delete()
        .where("id IN (:...ids)", { ids: assetIds })
        .execute();
    }

    // 5. Klasörü sil — DB ON DELETE CASCADE alt klasörleri de temizler
    await folderRepo.delete(folderId);
  }

  // ─── Yardımcılar ──────────────────────────────────────────────────

  /** İsim validasyonu — asset rename kurallarıyla aynı */
  private static validateName(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) {
      throw AppError.createAppError(MediaFolderErrors.INVALID_NAME);
    }
    if (trimmed.length > 200) {
      throw AppError.createAppError(MediaFolderErrors.NAME_TOO_LONG);
    }
    if (/[/\\:*?"<>|]/.test(trimmed)) {
      throw AppError.createAppError(MediaFolderErrors.INVALID_NAME);
    }
  }

  /**
   * `folderId`'nin `targetId`'nin alt ağacında olup olmadığını kontrol eder.
   * Döngüsel referans kontrolü için kullanılır.
   */
  private static async isDescendant(
    folderId: string,
    targetId: string,
  ): Promise<boolean> {
    const descendants = await MediaFolderService.collectDescendantIds(targetId);
    return descendants.includes(folderId);
  }

  /**
   * `parentId` altındaki tüm alt klasör ID'lerini özyinelemeli toplar.
   * Sonuç listesi `parentId`'nin kendisini içermez.
   */
  static async collectDescendantIds(parentId: string): Promise<string[]> {
    const repo = await this.repo();
    const children = await repo.find({
      select: { id: true },
      where: { parentId },
    });
    if (children.length === 0) return [];

    const ids = children.map((c) => c.id);
    const nested = await Promise.all(
      ids.map((id) => MediaFolderService.collectDescendantIds(id)),
    );
    return [...ids, ...nested.flat()];
  }
}
