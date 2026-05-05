import { Station } from "@/features/station/entity/station.entity";
import {
  CreateStationDto,
  StationService,
  UpdateStationDto,
} from "@/features/station/service/station.service";
import {
  DEFAULT_STATION_FILTERS,
  DEFAULT_STATION_SORT,
  STATION_PAGE_SIZE,
  StationFilters,
  StationSortKey,
} from "@/features/station/types/station-query";
import { create } from "zustand";

interface StationState {
  stations: Station[];
  hasMore: boolean;
  page: number; // last loaded page (0 means no data yet)
  isLoading: boolean; // initial / refresh
  isLoadingMore: boolean; // append page
  filters: StationFilters;
  sort: StationSortKey;
  /** Race-guard for in-flight loads — only the latest token's result is applied. */
  loadToken: number;
}

interface StationActions {
  load: () => Promise<void>;
  loadMore: () => Promise<void>;
  setFilters: (patch: Partial<StationFilters>) => void;
  setSort: (sort: StationSortKey) => void;
  resetFilters: () => void;
  create: (dto: CreateStationDto) => Promise<Station>;
  update: (id: string, dto: UpdateStationDto) => Promise<Station>;
  delete: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  getById: (id: string) => Station | null;
}

export const useStationStore = create<StationState & StationActions>()(
  (set, get) => ({
    stations: [],
    hasMore: false,
    page: 0,
    isLoading: false,
    isLoadingMore: false,
    filters: { ...DEFAULT_STATION_FILTERS },
    sort: DEFAULT_STATION_SORT,
    loadToken: 0,

    load: async () => {
      const token = get().loadToken + 1;
      set({ loadToken: token, isLoading: true, isLoadingMore: false });
      try {
        const { items, hasMore } = await StationService.query({
          filters: get().filters,
          sort: get().sort,
          limit: STATION_PAGE_SIZE,
          offset: 0,
        });
        if (get().loadToken !== token) return; // a newer load superseded us
        set({ stations: items, hasMore, page: 1, isLoading: false });
      } catch (err) {
        if (get().loadToken !== token) return;
        set({ isLoading: false });
        throw err;
      }
    },

    loadMore: async () => {
      const { hasMore, isLoadingMore, isLoading, page } = get();
      if (!hasMore || isLoadingMore || isLoading) return;
      const token = get().loadToken; // keep current token; loadMore must abort if a refresh starts
      set({ isLoadingMore: true });
      try {
        const nextPage = page + 1;
        const { items, hasMore: more } = await StationService.query({
          filters: get().filters,
          sort: get().sort,
          limit: STATION_PAGE_SIZE,
          offset: page * STATION_PAGE_SIZE,
        });
        if (get().loadToken !== token) return; // refresh kicked in mid-flight
        // Defensive de-dup in case rows shifted between pages
        const seen = new Set(get().stations.map((s) => s.id));
        const appended = items.filter((s) => !seen.has(s.id));
        set({
          stations: [...get().stations, ...appended],
          hasMore: more,
          page: nextPage,
          isLoadingMore: false,
        });
      } catch (err) {
        if (get().loadToken !== token) return;
        set({ isLoadingMore: false });
        throw err;
      }
    },

    setFilters: (patch) => {
      set((s) => ({ filters: { ...s.filters, ...patch } }));
      void get().load();
    },

    setSort: (sort) => {
      set({ sort });
      void get().load();
    },

    resetFilters: () => {
      set({
        filters: { ...DEFAULT_STATION_FILTERS },
        sort: DEFAULT_STATION_SORT,
      });
      void get().load();
    },

    create: async (dto) => {
      const station = await StationService.create(dto);
      // Refresh from DB so new item respects current filters & sort.
      void get().load();
      return station;
    },

    update: async (id, dto) => {
      const updated = await StationService.update(id, dto);
      // Refresh — the update might move it in/out of the current filter set.
      void get().load();
      return updated;
    },

    delete: async (id) => {
      await StationService.delete(id);
      set((s) => ({ stations: s.stations.filter((st) => st.id !== id) }));
      // If we lost a row and there's more on the server, top up so the
      // viewport doesn't end with a partial page.
      const { stations, hasMore } = get();
      if (hasMore && stations.length < STATION_PAGE_SIZE) {
        void get().load();
      }
    },

    toggleFavorite: async (id) => {
      const updated = await StationService.toggleFavorite(id);
      set((s) => ({
        stations: s.stations.map((st) => (st.id === id ? updated : st)),
      }));
    },

    getById: (id) => get().stations.find((s) => s.id === id) ?? null,
  }),
);
