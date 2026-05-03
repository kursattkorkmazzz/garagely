import { AssetEntity } from "@/features/asset/entity/asset.entity";
import { MediaFolderEntity } from "@/features/asset/entity/media-folder.entity";
import { AssetService } from "@/features/asset/service/asset.service";
import {
  CascadeStats,
  MediaFolderService,
} from "@/features/asset/service/media-folder.service";
import { AssetTypes } from "@/features/asset/types/asset-type.type";
import { create } from "zustand";

const PAGE_SIZE = 20;
const RECENT_LIMIT = 10;

type TypeFilter = "all" | "media" | "documents";

interface GalleryState {
  assetsById: Record<string, AssetEntity>;
  orderedIds: string[];
  recentIds: string[];
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  // Klasör navigasyon
  currentFolderId: string | null;     // null = root (Tüm Dosyalar)
  folderPath: MediaFolderEntity[];    // breadcrumb: [root, ..., current]
  subFolders: MediaFolderEntity[];    // mevcut klasörün alt klasörleri
  // Filtre
  activeTypeFilter: TypeFilter;
  // Seçim modu
  isSelecting: boolean;
  selectedIds: Set<string>;
}

interface GalleryActions {
  // Yükleme
  loadInitial: () => Promise<void>;
  loadMore: () => Promise<void>;
  // Klasör navigasyon
  navigateToFolder: (folderId: string | null) => Promise<void>;
  navigateBack: () => Promise<void>;
  // Klasör CRUD
  createFolder: (name: string) => Promise<MediaFolderEntity>;
  renameFolder: (id: string, name: string) => Promise<void>;
  moveFolder: (folderId: string, targetParentId: string | null) => Promise<void>;
  deleteFolderWithWarning: (id: string) => Promise<CascadeStats>;
  deleteFolder: (id: string) => Promise<void>;
  // Asset işlemleri
  uploadImage: (uri: string) => Promise<AssetEntity>;
  uploadVideo: (uri: string) => Promise<AssetEntity>;
  uploadDocument: (uri: string) => Promise<AssetEntity>;
  deleteAsset: (id: string) => Promise<void>;
  deleteSelected: () => Promise<void>;
  renameAsset: (id: string, newBaseName: string) => Promise<void>;
  moveAsset: (assetId: string, targetFolderId: string | null) => Promise<void>;
  // Filtre & seçim
  setTypeFilter: (filter: TypeFilter) => void;
  enterSelectionMode: (id: string) => void;
  toggleSelection: (id: string) => void;
  exitSelectionMode: () => void;
  // Selector'lar
  getOrderedAssets: () => AssetEntity[];
  getRecentAssets: () => AssetEntity[];
  getFilteredAssets: () => AssetEntity[];
}

export const useGalleryStore = create<GalleryState & GalleryActions>()(
  (set, get) => ({
    // ─── Initial State ───────────────────────────────────────────────
    assetsById: {},
    orderedIds: [],
    recentIds: [],
    page: 0,
    hasMore: true,
    isLoading: false,
    isLoadingMore: false,
    currentFolderId: null,
    folderPath: [],
    subFolders: [],
    activeTypeFilter: "all",
    isSelecting: false,
    selectedIds: new Set<string>(),

    // ─── Yükleme ─────────────────────────────────────────────────────

    loadInitial: async () => {
      set({ isLoading: true });

      // Fiziksel dosyası olmayan kayıtları temizle (backup/restore sonrası)
      await AssetService.pruneOrphanedAssets();

      const [assets, recent, subFolders] = await Promise.all([
        AssetService.getAll(PAGE_SIZE, 0),
        AssetService.getRecent(RECENT_LIMIT),
        MediaFolderService.getRootFolders(),
      ]);

      const assetsById: Record<string, AssetEntity> = {};
      [...assets, ...recent].forEach((a) => {
        assetsById[a.id] = a;
      });

      set({
        assetsById,
        orderedIds: assets.map((a) => a.id),
        recentIds: recent.map((a) => a.id),
        subFolders,
        currentFolderId: null,
        folderPath: [],
        page: 1,
        hasMore: assets.length === PAGE_SIZE,
        isLoading: false,
      });
    },

    loadMore: async () => {
      const { isLoadingMore, hasMore, page, currentFolderId } = get();
      if (isLoadingMore || !hasMore) return;
      set({ isLoadingMore: true });

      const assets = currentFolderId
        ? await AssetService.getByFolder(currentFolderId, PAGE_SIZE, page * PAGE_SIZE)
        : await AssetService.getAll(PAGE_SIZE, page * PAGE_SIZE);

      set((s) => ({
        assetsById: {
          ...s.assetsById,
          ...Object.fromEntries(assets.map((a) => [a.id, a])),
        },
        orderedIds: [...s.orderedIds, ...assets.map((a) => a.id)],
        page: page + 1,
        hasMore: assets.length === PAGE_SIZE,
        isLoadingMore: false,
      }));
    },

    // ─── Klasör Navigasyon ────────────────────────────────────────────

    navigateToFolder: async (folderId) => {
      set({ isLoading: true, isSelecting: false, selectedIds: new Set() });

      const [assets, subFolders, folderPath] = await Promise.all([
        folderId
          ? AssetService.getByFolder(folderId, PAGE_SIZE, 0)
          : AssetService.getAll(PAGE_SIZE, 0),
        folderId
          ? MediaFolderService.getChildren(folderId)
          : MediaFolderService.getRootFolders(),
        folderId
          ? MediaFolderService.getFolderPath(folderId)
          : Promise.resolve([]),
      ]);

      const assetsById: Record<string, AssetEntity> = {};
      assets.forEach((a) => {
        assetsById[a.id] = a;
      });

      set({
        currentFolderId: folderId,
        folderPath,
        subFolders,
        assetsById,
        orderedIds: assets.map((a) => a.id),
        page: 1,
        hasMore: assets.length === PAGE_SIZE,
        isLoading: false,
      });
    },

    navigateBack: async () => {
      const { folderPath } = get();
      if (folderPath.length === 0) return; // zaten root'ta
      const parentId =
        folderPath.length >= 2 ? folderPath[folderPath.length - 2].id : null;
      await get().navigateToFolder(parentId);
    },

    // ─── Klasör CRUD ──────────────────────────────────────────────────

    createFolder: async (name) => {
      const { currentFolderId } = get();
      const folder = await MediaFolderService.create({
        name,
        parentId: currentFolderId,
      });
      set((s) => ({
        subFolders: [...s.subFolders, folder].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      }));
      return folder;
    },

    renameFolder: async (id, name) => {
      const updated = await MediaFolderService.rename(id, { name });
      set((s) => ({
        subFolders: s.subFolders
          .map((f) => (f.id === id ? updated : f))
          .sort((a, b) => a.name.localeCompare(b.name)),
        // Breadcrumb'da da güncelle
        folderPath: s.folderPath.map((f) => (f.id === id ? updated : f)),
      }));
    },

    moveFolder: async (folderId, targetParentId) => {
      await MediaFolderService.moveFolder(folderId, targetParentId);
      // Mevcut klasörden taşındıysa listeden kaldır
      set((s) => ({
        subFolders: s.subFolders.filter((f) => f.id !== folderId),
      }));
    },

    deleteFolderWithWarning: async (id) => {
      return MediaFolderService.getCascadeStats(id);
    },

    deleteFolder: async (id) => {
      await MediaFolderService.deleteCascade(id);
      set((s) => {
        // Silinen klasördeki asset'leri state'ten temizle
        const removedAssetIds = s.orderedIds.filter(
          (aid) => s.assetsById[aid]?.folderId === id,
        );
        const newAssetsById = { ...s.assetsById };
        removedAssetIds.forEach((aid) => delete newAssetsById[aid]);
        return {
          subFolders: s.subFolders.filter((f) => f.id !== id),
          assetsById: newAssetsById,
          orderedIds: s.orderedIds.filter(
            (aid) => !removedAssetIds.includes(aid),
          ),
          recentIds: s.recentIds.filter(
            (rid) => !removedAssetIds.includes(rid),
          ),
        };
      });
    },

    // ─── Asset İşlemleri ──────────────────────────────────────────────

    uploadImage: async (uri) => {
      const { currentFolderId } = get();
      const asset = await AssetService.uploadImageAsset(uri, {
        folderId: currentFolderId,
      });
      set((s) => ({
        assetsById: { [asset.id]: asset, ...s.assetsById },
        orderedIds: [asset.id, ...s.orderedIds],
        recentIds: [asset.id, ...s.recentIds].slice(0, RECENT_LIMIT),
      }));
      return asset;
    },

    uploadVideo: async (uri) => {
      const { currentFolderId } = get();
      const asset = await AssetService.uploadVideoAsset(uri, {
        folderId: currentFolderId,
      });
      set((s) => ({
        assetsById: { [asset.id]: asset, ...s.assetsById },
        orderedIds: [asset.id, ...s.orderedIds],
        recentIds: [asset.id, ...s.recentIds].slice(0, RECENT_LIMIT),
      }));
      return asset;
    },

    uploadDocument: async (uri) => {
      const { currentFolderId } = get();
      const asset = await AssetService.uploadDocumentAsset(uri, {
        folderId: currentFolderId,
      });
      set((s) => ({
        assetsById: { [asset.id]: asset, ...s.assetsById },
        orderedIds: [asset.id, ...s.orderedIds],
      }));
      return asset;
    },

    deleteAsset: async (id) => {
      await AssetService.deleteById(id);
      set((s) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [id]: _removed, ...rest } = s.assetsById;
        return {
          assetsById: rest,
          orderedIds: s.orderedIds.filter((oid) => oid !== id),
          recentIds: s.recentIds.filter((oid) => oid !== id),
        };
      });
    },

    deleteSelected: async () => {
      const ids = Array.from(get().selectedIds);
      await Promise.all(ids.map((id) => AssetService.deleteById(id)));
      set((s) => {
        const idSet = new Set(ids);
        const assetsById = { ...s.assetsById };
        ids.forEach((id) => delete assetsById[id]);
        return {
          assetsById,
          orderedIds: s.orderedIds.filter((id) => !idSet.has(id)),
          recentIds: s.recentIds.filter((id) => !idSet.has(id)),
          isSelecting: false,
          selectedIds: new Set<string>(),
        };
      });
    },

    renameAsset: async (id, newBaseName) => {
      const updated = await AssetService.rename(id, newBaseName);
      set((s) => ({
        assetsById: { ...s.assetsById, [id]: updated },
      }));
    },

    moveAsset: async (assetId, targetFolderId) => {
      await AssetService.moveAsset(assetId, targetFolderId);
      // Farklı klasöre taşındıysa mevcut listeden kaldır
      const { currentFolderId } = get();
      if (targetFolderId !== currentFolderId) {
        set((s) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [assetId]: _removed, ...rest } = s.assetsById;
          return {
            assetsById: rest,
            orderedIds: s.orderedIds.filter((id) => id !== assetId),
            recentIds: s.recentIds.filter((id) => id !== assetId),
          };
        });
      }
    },

    // ─── Filtre & Seçim ───────────────────────────────────────────────

    setTypeFilter: (filter) => set({ activeTypeFilter: filter }),

    enterSelectionMode: (id) => {
      set({ isSelecting: true, selectedIds: new Set([id]) });
    },

    toggleSelection: (id) => {
      const next = new Set(get().selectedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      if (next.size === 0) {
        set({ isSelecting: false, selectedIds: next });
      } else {
        set({ selectedIds: next });
      }
    },

    exitSelectionMode: () => {
      set({ isSelecting: false, selectedIds: new Set<string>() });
    },

    // ─── Selector'lar ─────────────────────────────────────────────────

    getOrderedAssets: () => {
      const { assetsById, orderedIds } = get();
      return orderedIds.map((id) => assetsById[id]).filter(Boolean);
    },

    getRecentAssets: () => {
      const { assetsById, recentIds } = get();
      return recentIds.map((id) => assetsById[id]).filter(Boolean);
    },

    getFilteredAssets: () => {
      const { assetsById, orderedIds, activeTypeFilter } = get();
      let assets = orderedIds.map((id) => assetsById[id]).filter(Boolean);

      if (activeTypeFilter === "media") {
        assets = assets.filter(
          (a) => a.type === AssetTypes.IMAGE || a.type === AssetTypes.VIDEO,
        );
      } else if (activeTypeFilter === "documents") {
        assets = assets.filter((a) => a.type === AssetTypes.DOCUMENT);
      }

      return assets;
    },
  }),
);
