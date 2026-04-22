import { StorageErrors } from "@/features/asset/errors/storage.errors";
import { StorageAsset } from "@/features/asset/model/storage-asset";
import {
  getExtensionFromMimeType,
  MimeType,
  UNKNOWN_MIME_TYPE,
} from "@/features/asset/types/mime-type.type";
import { AppError } from "@/shared/errors/app-error";
import * as ExpoCrypto from "expo-crypto";
import { File, Paths } from "expo-file-system";
export class ExpoFileSystemStorage {
  static readonly BASE_FINAL_STORAGE_PATH: string = Paths.document + "storage";
  static readonly BASE_TEMPORARY_STORAGE_PATH: string = Paths.cache + "storage";

  // ─── Path Builders ────────────────────────────────────────────────

  static buildTempPath(name: string, ext: string): string {
    return `${this.BASE_TEMPORARY_STORAGE_PATH}/${name}.${ext}`;
  }

  static buildFinalPath(name: string, ext: string): string {
    // storage/{assetId}.{ext}
    return `${this.BASE_FINAL_STORAGE_PATH}/${name}.${ext}`;
  }

  // -- CRUD Operations on File -----

  static async uploadFileToTemp(uri: string): Promise<StorageAsset> {
    try {
      const originalFile = new File(uri);
      if (!originalFile.exists) {
        throw AppError.createAppError(
          StorageErrors.FILE_NOT_FOUND_ERROR,
          undefined,
          { uri },
        );
      }

      const tempId = ExpoCrypto.randomUUID();
      const mimeType = originalFile.type;
      const extension = getExtensionFromMimeType(mimeType);

      if (extension === UNKNOWN_MIME_TYPE) {
        throw AppError.createAppError(
          StorageErrors.UNKNOWN_MIME_TYPE_ERROR,
          undefined,
          { mimeType },
        );
      }

      const tempPath = this.buildTempPath(tempId, extension);
      const destionationFile = new File(tempPath);
      originalFile.copy(destionationFile);
      return {
        fullPath: destionationFile.uri,
        basePath: this.BASE_TEMPORARY_STORAGE_PATH,
        baseName: destionationFile.name.split(".")[0],
        extension: destionationFile.name.split(".")[1],
        fullName: destionationFile.name,
        mimeType: destionationFile.type as MimeType,
        sizeBytes: destionationFile.size,
        isTemp: true,
      };
    } catch (err) {
      console.error("Error uploading file:", err);
      throw AppError.createAppError(
        StorageErrors.STORAGE_WRITE_ERROR,
        undefined,
        { uri },
      );
    }
  }

  static async commitFile(
    tempAsset: StorageAsset,
    finalAssetId: string,
  ): Promise<StorageAsset> {
    try {
      const tempPath = this.buildTempPath(
        tempAsset.baseName,
        tempAsset.extension,
      );

      const tempFile = new File(tempPath);
      if (!tempFile.exists) {
        throw AppError.createAppError(
          StorageErrors.FILE_NOT_FOUND_ERROR,
          undefined,
          { tempPath },
        );
      }

      const finalPath = this.buildFinalPath(finalAssetId, tempAsset.extension);
      const finalFile = new File(finalPath);
      tempFile.copy(finalFile);
      tempFile.delete();

      return {
        isTemp: false,
        baseName: finalFile.name.split(".")[0],
        extension: finalFile.name.split(".")[1],
        fullName: finalFile.name,
        fullPath: finalFile.uri,
        basePath: this.BASE_FINAL_STORAGE_PATH,
        mimeType: finalFile.type as MimeType,
        sizeBytes: finalFile.size,
      };
    } catch (err) {
      console.error("Error committing file:", err);
      throw AppError.createAppError(
        StorageErrors.STORAGE_COMMIT_ERROR,
        undefined,
        { tempAsset, finalAssetId },
      );
    }
  }

  static async rollbackTempFile(tempAsset: StorageAsset): Promise<void> {
    try {
      const tempFile = await this.getFile(tempAsset);
      this.deleteFile(tempFile);
    } catch (err) {
      console.error("Error rolling back temp file:", err);
      throw AppError.createAppError(
        StorageErrors.STORAGE_DELETE_ERROR,
        undefined,
        { tempAsset },
      );
    }
  }

  static async deleteFile(storageAsset: StorageAsset): Promise<void> {
    try {
      let path = "";

      if (storageAsset.isTemp) {
        path = this.buildTempPath(
          storageAsset.baseName,
          storageAsset.extension,
        );
      } else {
        path = this.buildFinalPath(
          storageAsset.baseName,
          storageAsset.extension,
        );
      }

      const finalFile = new File(path);

      if (finalFile.exists) {
        finalFile.delete();
      }
    } catch (err) {
      console.error("Error deleting file:", err);
      throw AppError.createAppError(
        StorageErrors.STORAGE_DELETE_ERROR,
        undefined,
        { storageAsset },
      );
    }
  }

  static async getFile(storageAsset: StorageAsset): Promise<StorageAsset> {
    let path: string = "";
    if (storageAsset.isTemp) {
      path = this.buildTempPath(storageAsset.baseName, storageAsset.extension);
    } else {
      path = this.buildFinalPath(storageAsset.baseName, storageAsset.extension);
    }
    const file = new File(path);
    if (!file.exists) {
      throw AppError.createAppError(
        StorageErrors.FILE_NOT_FOUND_ERROR,
        undefined,
        { path },
      );
    }
    return {
      fullPath: file.uri,
      basePath: storageAsset.isTemp
        ? this.BASE_TEMPORARY_STORAGE_PATH
        : this.BASE_FINAL_STORAGE_PATH,
      baseName: file.name.split(".")[0],
      extension: file.name.split(".")[1],
      fullName: file.name,
      mimeType: file.type as MimeType,
      sizeBytes: file.size,
      isTemp: storageAsset.isTemp,
    };
  }

  static async isFileExists(storageAsset: StorageAsset): Promise<boolean> {
    const finalPath = this.buildFinalPath(
      storageAsset.baseName,
      storageAsset.extension,
    );
    const finalFile = new File(finalPath);
    return finalFile.exists;
  }
}
