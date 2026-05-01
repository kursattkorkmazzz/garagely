import { AssetCategoryEntity } from "@/features/asset/entity/asset-category.entity";
import { AssetEntity } from "@/features/asset/entity/asset.entity";
import { AssetCategoryService } from "@/features/asset/service/asset-category.service";
import { AssetService } from "@/features/asset/service/asset.service";
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
  categories: AssetCategoryEntity[];
  activeCategoryId: string | null;
  activeTypeFilter: TypeFilter;
  // Seçim modu
  isSelecting: boolean;
  selectedIds: Set<string>;
}

interface GalleryActions {
  loadInitial: () => Promise<void>;
  loadMore: () => Promise<void>;
  loadCategories: () => Promise<void>;
  uploadImage: (uri: string) => Promise<AssetEntity>;
  uploadVideo: (uri: string) => Promise<AssetEntity>;
  uploadDocument: (uri: string) => Promise<AssetEntity>;
  deleteAsset: (id: string) => Promise<void>;
  deleteSelected: () => Promise<void>;
  addAssetToCategory: (assetId: string, categoryId: string) => Promise<void>;
  removeAssetFromCategory: (
    assetId: string,
    categoryId: string,
  ) => Promise<void>;
  setActiveCategory: (id: string | null) => void;
  setTypeFilter: (filter: TypeFilter) => void;
  enterSelectionMode: (id: string) => void;
  toggleSelection: (id: string) => void;
  exitSelectionMode: () => void;
  getOrderedAssets: () => AssetEntity[];
  getRecentAssets: () => AssetEntity[];
  getFilteredAssets: () => AssetEntity[];
}

export const useGalleryStore = create<GalleryState & GalleryActions>()(
  (set, get) => ({
    assetsById: {},
    orderedIds: [],
    recentIds: [],
    page: 0,
    hasMore: true,
    isLoading: false,
    isLoadingMore: false,
    categories: [],
    activeCategoryId: null,
    activeTypeFilter: "all",
    isSelecting: false,
    selectedIds: new Set<string>(),

    loadInitial: async () => {
      set({ isLoading: true });
      const [assets, recent, categories] = await Promise.all([
        AssetService.getAll(PAGE_SIZE, 0),
        AssetService.getRecent(RECENT_LIMIT),
        AssetCategoryService.getAll(),
      ]);
      const assetsById: Record<string, AssetEntity> = {};
      [...assets, ...recent].forEach((a) => {
        assetsById[a.id] = a;
      });
      set({
        assetsById,
        orderedIds: assets.map((a) => a.id),
        recentIds: recent.map((a) => a.id),
        categories,
        page: 1,
        hasMore: assets.length === PAGE_SIZE,
        isLoading: false,
      });
    },

    loadMore: async () => {
      const { isLoadingMore, hasMore, page } = get();
      if (isLoadingMore || !hasMore) return;
      set({ isLoadingMore: true });
      const assets = await AssetService.getAll(PAGE_SIZE, page * PAGE_SIZE);
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

    loadCategories: async () => {
      const categories = await AssetCategoryService.getAll();
      set({ categories });
    },

    uploadImage: async (uri) => {
      const asset = await AssetService.uploadImageAsset(uri);
      set((s) => ({
        assetsById: { [asset.id]: asset, ...s.assetsById },
        orderedIds: [asset.id, ...s.orderedIds],
        recentIds: [asset.id, ...s.recentIds].slice(0, RECENT_LIMIT),
      }));
      return asset;
    },

    uploadVideo: async (uri) => {
      const asset = await AssetService.uploadVideoAsset(uri);
      set((s) => ({
        assetsById: { [asset.id]: asset, ...s.assetsById },
        orderedIds: [asset.id, ...s.orderedIds],
        recentIds: [asset.id, ...s.recentIds].slice(0, RECENT_LIMIT),
      }));
      return asset;
    },

    uploadDocument: async (uri) => {
      const asset = await AssetService.uploadDocumentAsset(uri);
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

    addAssetToCategory: async (assetId, categoryId) => {
      await AssetCategoryService.addAsset(categoryId, assetId);
      const updated = await AssetService.getById(assetId);
      if (updated) {
        set((s) => ({
          assetsById: { ...s.assetsById, [assetId]: updated },
        }));
      }
    },

    removeAssetFromCategory: async (assetId, categoryId) => {
      await AssetCategoryService.removeAsset(categoryId, assetId);
      const updated = await AssetService.getById(assetId);
      if (updated) {
        set((s) => ({
          assetsById: { ...s.assetsById, [assetId]: updated },
        }));
      }
    },

    setActiveCategory: (id) => set({ activeCategoryId: id }),

    setTypeFilter: (filter) => set({ activeTypeFilter: filter }),

    getOrderedAssets: () => {
      const { assetsById, orderedIds } = get();
      return orderedIds.map((id) => assetsById[id]).filter(Boolean);
    },

    getRecentAssets: () => {
      const { assetsById, recentIds } = get();
      return recentIds.map((id) => assetsById[id]).filter(Boolean);
    },

    getFilteredAssets: () => {
      const { assetsById, orderedIds, activeCategoryId, activeTypeFilter } =
        get();
      let assets = orderedIds.map((id) => assetsById[id]).filter(Boolean);

      if (activeTypeFilter === "media") {
        assets = assets.filter(
          (a) =>
            a.type === AssetTypes.IMAGE || a.type === AssetTypes.VIDEO,
        );
      } else if (activeTypeFilter === "documents") {
        assets = assets.filter((a) => a.type === AssetTypes.DOCUMENT);
      }

      if (activeCategoryId !== null) {
        assets = assets.filter((a) =>
          a.categories?.some((c) => c.id === activeCategoryId),
        );
      }

      return assets;
    },
  }),
);
