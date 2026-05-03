/**
 * @deprecated — MediaFolderService ile değiştirildi.
 * Bu dosya Phase 4 (gallery store güncellemesi) sonrasında silinecek.
 */
export class AssetCategoryService {
  static async getAll() {
    return [];
  }

  static async addAsset(_categoryId: string, _assetId: string): Promise<void> {
    // no-op — replaced by MediaFolderService
  }

  static async removeAsset(_categoryId: string, _assetId: string): Promise<void> {
    // no-op — replaced by MediaFolderService
  }
}
