import { GetGaragelyDatabase } from "@/db/db";
import { AssetEntity } from "@/features/asset/entity/asset.entity";
import { ImageMetadataEntity } from "@/features/asset/entity/metadata/image-metadata.entity";
import { AssetErrors } from "@/features/asset/errors/asset.errors";
import { StorageAsset } from "@/features/asset/model/storage-asset";
import { ExpoFileSystemStorage } from "@/features/asset/storage/expo-fs-storage";
import { AssetTypes } from "@/features/asset/types/asset-type.type";
import { UploadAssetOptions } from "@/features/asset/types/asset.service.type";
import {
  ImageMimeTypes,
  MimeType,
} from "@/features/asset/types/mime-type.type";
import { AppError } from "@/shared/errors/app-error";
import { File } from "expo-file-system";
import { Image } from "react-native";
export class AssetService {
  static storageRepository = ExpoFileSystemStorage;

  static readonly imageMimeTypes = Object.values(ImageMimeTypes);

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

  static async getAll(limit: number, offset: number): Promise<AssetEntity[]> {
    const repo = await AssetService.repo();
    return repo.find({
      order: { createdAt: "DESC" },
      take: limit,
      skip: offset,
      relations: ["categories"],
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
      relations: ["categories"],
    });
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
    options?: Omit<UploadAssetOptions, "type">,
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
