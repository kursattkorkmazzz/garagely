import { AssetErrors } from "@/features/asset/errors/asset.errors";
import { StorageErrors } from "@/features/asset/errors/storage.errors";
import { StorageAsset } from "@/features/asset/model/storage-asset";
import {
  getExtensionFromMimeType,
  MimeType,
  UNKNOWN_MIME_TYPE,
} from "@/features/asset/types/mime-type.type";
import { AppError } from "@/shared/errors/app-error";
import * as ExpoCrypto from "expo-crypto";
import { Directory, File, Paths } from "expo-file-system";

export class ExpoFileSystemStorage {
  // ─── Storage Directories ──────────────────────────────────────────

  /**
   * Kalıcı depolama klasörü — uygulama silinene kadar korunur.
   * Paths.document bir Directory instance'ı döner; ikinci arg alt klasör adı.
   */
  private static get finalStorageDir(): Directory {
    return new Directory(Paths.document, "storage");
  }

  /**
   * Geçici depolama klasörü — sistem tarafından temizlenebilir.
   */
  private static get tempStorageDir(): Directory {
    return new Directory(Paths.cache, "storage");
  }

  // ─── Helpers ──────────────────────────────────────────────────────

  /**
   * Klasör yoksa oluşturur. Her dosya işleminden önce çağrılmalı.
   */
  private static ensureDir(dir: Directory): void {
    if (!dir.exists) {
      dir.create({ intermediates: true });
    }
  }

  /**
   * Geçici depolamada bir File referansı döner (dosya henüz oluşmamış olabilir).
   */
  private static buildTempFile(name: string, ext: string): File {
    return new File(this.tempStorageDir, `${name}.${ext}`);
  }

  /**
   * Kalıcı depolamada bir File referansı döner.
   */
  private static buildFinalFile(name: string, ext: string): File {
    return new File(this.finalStorageDir, `${name}.${ext}`);
  }

  /**
   * Var olan bir File instance'ından StorageAsset model oluşturur.
   * file.extension → ".png" formatında gelir; başındaki nokta temizlenir.
   */
  private static toStorageAsset(file: File, isTemp: boolean): StorageAsset {
    const ext = file.extension.replace(/^\./, "");
    const fullName = file.name;
    // Çok noktalı dosya isimlerini (örn. "photo.backup.jpg") doğru ayrıştır
    const baseName = ext ? fullName.slice(0, -(ext.length + 1)) : fullName;
    return {
      fullPath: file.uri,
      basePath: isTemp
        ? this.tempStorageDir.uri
        : this.finalStorageDir.uri,
      baseName,
      extension: ext,
      fullName,
      mimeType: file.type as MimeType,
      sizeBytes: file.size,
      isTemp,
    };
  }

  // ─── Public API ───────────────────────────────────────────────────

  /**
   * Kaynak URI'daki dosyayı geçici depolamaya kopyalar.
   * Dönen StorageAsset.fullPath, işlemin geri kalanında doğrudan kullanılır.
   */
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

      const mimeType = originalFile.type;
      const extension = getExtensionFromMimeType(mimeType);
      if (extension === UNKNOWN_MIME_TYPE) {
        throw AppError.createAppError(
          StorageErrors.UNKNOWN_MIME_TYPE_ERROR,
          undefined,
          { mimeType },
        );
      }

      this.ensureDir(this.tempStorageDir);

      const tempId = ExpoCrypto.randomUUID();
      const destinationFile = this.buildTempFile(tempId, extension);
      originalFile.copy(destinationFile);

      return this.toStorageAsset(destinationFile, true);
    } catch (err) {
      console.error("[ExpoFileSystemStorage] uploadFileToTemp error:", err);
      throw AppError.createAppError(
        StorageErrors.STORAGE_WRITE_ERROR,
        undefined,
        { uri },
      );
    }
  }

  /**
   * Geçici dosyayı kalıcı depolamaya taşır; geçici dosyayı siler.
   * Hedef dosya adı olarak finalAssetId (uuid) kullanılır.
   */
  static async commitFile(
    tempAsset: StorageAsset,
    finalAssetId: string,
  ): Promise<StorageAsset> {
    try {
      // Doğrudan kayıtlı URI üzerinden erişim — path yeniden inşa etmeye gerek yok
      const tempFile = new File(tempAsset.fullPath);
      if (!tempFile.exists) {
        throw AppError.createAppError(
          StorageErrors.FILE_NOT_FOUND_ERROR,
          undefined,
          { uri: tempAsset.fullPath },
        );
      }

      this.ensureDir(this.finalStorageDir);

      const finalFile = this.buildFinalFile(finalAssetId, tempAsset.extension);
      tempFile.copy(finalFile);
      tempFile.delete();

      return this.toStorageAsset(finalFile, false);
    } catch (err) {
      console.error("[ExpoFileSystemStorage] commitFile error:", err);
      throw AppError.createAppError(
        StorageErrors.STORAGE_COMMIT_ERROR,
        undefined,
        { tempAsset, finalAssetId },
      );
    }
  }

  /**
   * Geçici dosyayı geri alır (transaction rollback sırasında kullanılır).
   */
  static async rollbackTempFile(tempAsset: StorageAsset): Promise<void> {
    try {
      const tempFile = new File(tempAsset.fullPath);
      if (tempFile.exists) {
        tempFile.delete();
      }
    } catch (err) {
      console.error("[ExpoFileSystemStorage] rollbackTempFile error:", err);
      throw AppError.createAppError(
        StorageErrors.STORAGE_DELETE_ERROR,
        undefined,
        { tempAsset },
      );
    }
  }

  /**
   * StorageAsset'in işaret ettiği dosyayı (geçici veya kalıcı) siler.
   * Dosya zaten yoksa sessizce geçer.
   */
  static async deleteFile(storageAsset: StorageAsset): Promise<void> {
    try {
      const file = new File(storageAsset.fullPath);
      if (file.exists) {
        file.delete();
      }
    } catch (err) {
      console.error("[ExpoFileSystemStorage] deleteFile error:", err);
      throw AppError.createAppError(
        StorageErrors.STORAGE_DELETE_ERROR,
        undefined,
        { storageAsset },
      );
    }
  }

  /**
   * StorageAsset'i güncel metadata ile döner.
   * Dosya yoksa FILE_NOT_FOUND_ERROR fırlatır.
   */
  static async getFile(storageAsset: StorageAsset): Promise<StorageAsset> {
    const file = new File(storageAsset.fullPath);
    if (!file.exists) {
      throw AppError.createAppError(
        StorageErrors.FILE_NOT_FOUND_ERROR,
        undefined,
        { uri: storageAsset.fullPath },
      );
    }
    return this.toStorageAsset(file, storageAsset.isTemp);
  }

  /**
   * Dosyanın var olup olmadığını kontrol eder.
   * fullPath üzerinden erişir — isTemp değerine bakılmaksızın çalışır.
   */
  static async isFileExists(storageAsset: StorageAsset): Promise<boolean> {
    return new File(storageAsset.fullPath).exists;
  }

  /**
   * Kalıcı depolamadaki bir dosyayı yeni bir baseName ile yeniden adlandırır.
   * Uzantı değişmez; sadece baseName güncellenir.
   * Hedef dosya zaten varsa NAME_ALREADY_EXISTS hatası fırlatır.
   * Eski dosya kopyalanır, ardından silinir (atomic move).
   */
  static async renameFile(
    asset: StorageAsset,
    newBaseName: string,
  ): Promise<StorageAsset> {
    try {
      const newFullName = `${newBaseName}.${asset.extension}`;
      const newFullPath = `${asset.basePath}${newFullName}`;

      // Hedef dosya çakışma kontrolü
      const targetFile = new File(newFullPath);
      if (targetFile.exists) {
        throw AppError.createAppError(AssetErrors.NAME_ALREADY_EXISTS, undefined, {
          newFullPath,
        });
      }

      const sourceFile = new File(asset.fullPath);
      if (!sourceFile.exists) {
        throw AppError.createAppError(StorageErrors.FILE_NOT_FOUND_ERROR, undefined, {
          uri: asset.fullPath,
        });
      }

      // Kopyala → eski dosyayı sil (move semantics)
      sourceFile.copy(targetFile);
      sourceFile.delete();

      return {
        ...asset,
        baseName: newBaseName,
        fullName: newFullName,
        fullPath: newFullPath,
      };
    } catch (err) {
      // AppError'ları olduğu gibi ilet
      if (err instanceof AppError) throw err;
      console.error("[ExpoFileSystemStorage] renameFile error:", err);
      throw AppError.createAppError(StorageErrors.STORAGE_WRITE_ERROR, undefined, {
        asset,
        newBaseName,
      });
    }
  }
}
