import { GetGaragelyDatabase } from "@/db/db";
import { AssetEntity } from "@/features/asset/entity/asset.entity";
import { ImageMetadataEntity } from "@/features/asset/entity/metadata/image-metadata.entity";
import { AssetErrors } from "@/features/asset/errors/asset.errors";
import { StorageAsset } from "@/features/asset/model/storage-asset";
import { ExpoFileSystemStorage } from "@/features/asset/storage/expo-fs-storage";
import { AssetTypes } from "@/features/asset/types/asset-type.type";
import { UploadAssetOptions } from "@/features/asset/types/asset.service.type";
import {
  DocumentMimeTypes,
  ImageMimeTypes,
  MimeType,
  VideoMimeTypes,
} from "@/features/asset/types/mime-type.type";
import { AppError } from "@/shared/errors/app-error";
import { File } from "expo-file-system";
import { Image } from "react-native";
export class AssetService {
  static storageRepository = ExpoFileSystemStorage;

  static readonly imageMimeTypes = Object.values(ImageMimeTypes);
  static readonly videoMimeTypes = Object.values(VideoMimeTypes);
  static readonly documentMimeTypes = Object.values(DocumentMimeTypes);

  private static async repo() {
    const db = await GetGaragelyDatabase();
    return db.getRepository(AssetEntity);
  }

  private static getImageDimensions(
    uri: string,
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      Image.getSize(
        uri,
        (width, height) => resolve({ width, height }),
        () => resolve({ width: 0, height: 0 }),
      );
    });
  }

  private static async uploadAsset(uri: string, options: UploadAssetOptions) {
    const file = new File(uri);
    if (typeof options?.maxSize === "number") {
      this.checkMaxSize(file.size, options.maxSize);
    }
    const folderId = options.folderId ?? null;

    let tempFile: StorageAsset | null = null;

    const queryRunner = (await GetGaragelyDatabase()).createQueryRunner();

    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      tempFile = await this.storageRepository.uploadFileToTemp(uri);

      const newAsset = new AssetEntity();

      newAsset.type = options.type;
      newAsset.mimeType = tempFile.mimeType;
      newAsset.baseName = tempFile.baseName;
      newAsset.extension = tempFile.extension;
      newAsset.fullName = tempFile.fullName;
      newAsset.basePath = tempFile.basePath;
      newAsset.fullPath = tempFile.fullPath;
      newAsset.sizeBytes = tempFile.sizeBytes;
      newAsset.folderId = folderId;

      const assetRepo = queryRunner.manager.getRepository(AssetEntity);

      const savedAssetEntity = await assetRepo.save(newAsset);

      const finalAssetId = savedAssetEntity.id;

      // commitFile geçici dosyayı kalıcı konuma taşır ve final path'i döner.
      const committedFile = await this.storageRepository.commitFile(
        tempFile,
        finalAssetId,
      );

      // assetRepo.save() aynı transaction içinde change detection yapmaz;
      // açık SQL UPDATE için queryRunner.manager.update() kullanıyoruz.
      await queryRunner.manager.update(AssetEntity, finalAssetId, {
        fullPath: committedFile.fullPath,
        basePath: committedFile.basePath,
        baseName: committedFile.baseName,
        fullName: committedFile.fullName,
      });

      // Resim metadata'sını (genişlik × yükseklik) kaydet.
      if (options.type === AssetTypes.IMAGE) {
        const { width, height } = await this.getImageDimensions(
          committedFile.fullPath,
        );
        const metadata = new ImageMetadataEntity();
        metadata.assetId = finalAssetId;
        metadata.width = width > 0 ? width : null;
        metadata.height = height > 0 ? height : null;
        await queryRunner.manager
          .getRepository(ImageMetadataEntity)
          .save(metadata);
      }

      await queryRunner.commitTransaction();

      // Transaction commit olduktan sonra güncel entity'yi döndür.
      const finalAssetEntity = await assetRepo.findOneByOrFail({
        id: finalAssetId,
      });

      return finalAssetEntity;
    } catch (error) {
      if (tempFile) {
        await this.storageRepository.deleteFile(tempFile);
      }
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      queryRunner.release();
    }
  }

  /**
   * İki yönlü temizlik — uygulama başlangıcında çağrılır:
   *  1. DB kaydı var, dosya yok → DB kaydını sil
   *  2. Dosya var, DB kaydı yok → dosyayı sil
   * Backup/restore veya reinstall sonrası tutarsızlığı giderir.
   */
  static async pruneOrphanedAssets(): Promise<void> {
    const repo = await this.repo();
    const db = await GetGaragelyDatabase();

    // ── 1. DB kaydı var, dosyası yok → DB'den sil ────────────────────
    const allRecords = await repo.find({ select: { id: true, fullPath: true } });

    const orphanedIds: string[] = [];
    for (const asset of allRecords) {
      if (!new File(asset.fullPath).exists) {
        orphanedIds.push(asset.id);
      }
    }

    if (orphanedIds.length > 0) {
      await db
        .getRepository(ImageMetadataEntity)
        .createQueryBuilder()
        .delete()
        .where("assetId IN (:...ids)", { ids: orphanedIds })
        .execute();

      await repo
        .createQueryBuilder()
        .delete()
        .where("id IN (:...ids)", { ids: orphanedIds })
        .execute();

      console.log(`[AssetService] Removed ${orphanedIds.length} orphaned DB record(s).`);
    }

    // ── 2. Dosya var, DB kaydı yok → dosyayı sil ─────────────────────
    const finalDir = ExpoFileSystemStorage.getFinalStorageDir();
    if (!finalDir.exists) return;

    const knownPaths = new Set(
      allRecords
        .filter((a) => !orphanedIds.includes(a.id))
        .map((a) => a.fullPath),
    );

    const diskFiles = finalDir.list();
    let deletedFiles = 0;

    for (const item of diskFiles) {
      if (item instanceof File && !knownPaths.has(item.uri)) {
        item.delete();
        deletedFiles++;
      }
    }

    if (deletedFiles > 0) {
      console.log(`[AssetService] Deleted ${deletedFiles} orphaned file(s) from disk.`);
    }
  }

  static async getAll(limit: number, offset: number): Promise<AssetEntity[]> {
    const repo = await AssetService.repo();
    return repo.find({
      order: { createdAt: "DESC" },
      take: limit,
      skip: offset,
      relations: ["folder"],
    });
  }

  /**
   * Belirli bir klasördeki asset'leri döner.
   * folderId null → klasörsüz (root'taki) asset'ler.
   */
  static async getByFolder(
    folderId: string | null,
    limit: number,
    offset: number,
  ): Promise<AssetEntity[]> {
    const repo = await AssetService.repo();
    const { IsNull } = await import("typeorm");
    return repo.find({
      where: { folderId: folderId ?? IsNull() },
      order: { createdAt: "DESC" },
      take: limit,
      skip: offset,
      relations: ["folder"],
    });
  }

  static async getRecent(limit = 10): Promise<AssetEntity[]> {
    const repo = await AssetService.repo();
    return repo.find({
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  static async getById(id: string): Promise<AssetEntity | null> {
    const repo = await AssetService.repo();
    return repo.findOne({
      where: { id },
      relations: ["folder"],
    });
  }

  /** Asset'i bir klasöre taşı (folderId null → klasörsüz / root) */
  static async moveAsset(
    assetId: string,
    targetFolderId: string | null,
  ): Promise<AssetEntity> {
    const repo = await AssetService.repo();
    await repo.update(assetId, { folderId: targetFolderId });
    return repo.findOneByOrFail({ id: assetId });
  }

  static async deleteById(id: string): Promise<void> {
    const db = await GetGaragelyDatabase();
    const repo = db.getRepository(AssetEntity);
    const asset = await repo.findOneBy({ id });
    if (!asset) {
      throw AppError.createAppError(AssetErrors.FILE_NOT_FOUND_ERROR);
    }

    // ImageMetadata varsa önce sil (repo.delete FK cascade tetiklemez)
    await db
      .getRepository(ImageMetadataEntity)
      .delete({ assetId: id });

    // Dosyayı dosya sisteminden sil
    const storageAsset: StorageAsset = {
      baseName: asset.baseName,
      extension: asset.extension,
      fullPath: asset.fullPath,
      fullName: asset.fullName,
      basePath: asset.basePath,
      mimeType: asset.mimeType,
      sizeBytes: asset.sizeBytes,
      isTemp: false,
    };
    await ExpoFileSystemStorage.deleteFile(storageAsset);

    // Asset kaydını sil
    await repo.delete(id);
  }

  static async uploadImageAsset(
    uri: string,
    options?: Omit<UploadAssetOptions, "type"> & { folderId?: string | null },
  ) {
    const originalFile = new File(uri);
    if (!originalFile.exists) {
      throw AppError.createAppError(
        AssetErrors.FILE_NOT_FOUND_ERROR,
        undefined,
        {
          uri,
        },
      );
    }
    const mimeType = originalFile.type;

    this.isSupportedMimeType(mimeType as any, this.imageMimeTypes);

    return this.uploadAsset(uri, {
      ...options,
      type: AssetTypes.IMAGE, // Force type to IMAGE for this method
    });
  }

  static async uploadVideoAsset(
    uri: string,
    options?: Omit<UploadAssetOptions, "type"> & { folderId?: string | null },
  ) {
    const originalFile = new File(uri);
    if (!originalFile.exists) {
      throw AppError.createAppError(AssetErrors.FILE_NOT_FOUND_ERROR, undefined, { uri });
    }
    this.isSupportedMimeType(originalFile.type as any, this.videoMimeTypes);
    return this.uploadAsset(uri, { ...options, type: AssetTypes.VIDEO });
  }

  static async uploadDocumentAsset(
    uri: string,
    options?: Omit<UploadAssetOptions, "type"> & { folderId?: string | null },
  ) {
    const originalFile = new File(uri);
    if (!originalFile.exists) {
      throw AppError.createAppError(AssetErrors.FILE_NOT_FOUND_ERROR, undefined, { uri });
    }
    this.isSupportedMimeType(originalFile.type as any, this.documentMimeTypes);
    return this.uploadAsset(uri, { ...options, type: AssetTypes.DOCUMENT });
  }

  /**
   * Asset'in baseName'ini değiştirir — fiziksel dosyayı ve DB kaydını günceller.
   * Sıra: dosya taşı → DB güncelle. DB başarısız olursa dosya geri taşınır.
   */
  static async rename(id: string, newBaseName: string): Promise<AssetEntity> {
    const trimmed = newBaseName.trim();

    // Validasyon
    if (!trimmed) {
      throw AppError.createAppError(AssetErrors.INVALID_NAME);
    }
    if (trimmed.length > 200) {
      throw AppError.createAppError(AssetErrors.NAME_TOO_LONG);
    }
    // Dosya sisteminde geçersiz karakterler
    if (/[/\\:*?"<>|]/.test(trimmed)) {
      throw AppError.createAppError(AssetErrors.INVALID_NAME);
    }

    const repo = await this.repo();
    const asset = await repo.findOneByOrFail({ id });

    const storageAsset: StorageAsset = {
      baseName: asset.baseName,
      fullName: asset.fullName,
      fullPath: asset.fullPath,
      basePath: asset.basePath,
      extension: asset.extension,
      mimeType: asset.mimeType,
      sizeBytes: asset.sizeBytes,
      isTemp: false,
    };

    // 1. Fiziksel dosyayı yeniden adlandır
    const renamed = await ExpoFileSystemStorage.renameFile(storageAsset, trimmed);

    // 2. DB güncelle — başarısız olursa dosyayı eski yerine geri al
    try {
      await repo.update(id, {
        baseName: renamed.baseName,
        fullName: renamed.fullName,
        fullPath: renamed.fullPath,
      });
    } catch (err) {
      // Rollback: yeni dosyayı eski adıyla geri taşı
      await ExpoFileSystemStorage.renameFile(renamed, asset.baseName);
      throw err;
    }

    return repo.findOneByOrFail({ id });
  }

  private static checkMaxSize(fileSize: number, maxSize: number): void {
    if (fileSize > maxSize) {
      throw AppError.createAppError(
        AssetErrors.MAX_FILE_SIZE_EXCEEDED,
        undefined,
        { size: fileSize, maxSize: maxSize },
      );
    }
  }

  private static isSupportedMimeType(
    fileMimeType: number,
    supportedMimeTypes: MimeType[],
  ): void {
    if (!supportedMimeTypes.includes(fileMimeType as any)) {
      throw AppError.createAppError(
        AssetErrors.NOT_SUPPORTED_MIME_TYPE,
        undefined,
        { mimeType: fileMimeType },
      );
    }
  }
}
