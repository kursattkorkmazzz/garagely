import { Station } from "@/features/station/entity/station.entity";
import {
  CreateStationDto,
  StationService,
  UpdateStationDto,
} from "@/features/station/service/station.service";
import { StationType } from "@/features/station/types/station-type";
import { create } from "zustand";

interface StationState {
  stations: Station[];
  isLoading: boolean;
  typeFilter: StationType | null;
}

interface StationActions {
  load: () => Promise<void>;
  create: (dto: CreateStationDto) => Promise<Station>;
  update: (id: string, dto: UpdateStationDto) => Promise<Station>;
  delete: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  setTypeFilter: (type: StationType | null) => void;
  getById: (id: string) => Station | null;
}

export const useStationStore = create<StationState & StationActions>()(
  (set, get) => ({
    stations: [],
    isLoading: false,
    typeFilter: null,

    load: async () => {
      set({ isLoading: true });
      const stations = await StationService.getAll();
      set({ stations, isLoading: false });
    },

    create: async (dto) => {
      const station = await StationService.create(dto);
      set((s) => ({ stations: [station, ...s.stations] }));
      return station;
    },

    update: async (id, dto) => {
      const updated = await StationService.update(id, dto);
      set((s) => ({
        stations: s.stations.map((st) => (st.id === id ? updated : st)),
      }));
      return updated;
    },

    delete: async (id) => {
      await StationService.delete(id);
      set((s) => ({ stations: s.stations.filter((st) => st.id !== id) }));
    },

    toggleFavorite: async (id) => {
      const updated = await StationService.toggleFavorite(id);
      set((s) => ({
        stations: s.stations.map((st) => (st.id === id ? updated : st)),
      }));
    },

    setTypeFilter: (type) => set({ typeFilter: type }),

    getById: (id) => get().stations.find((s) => s.id === id) ?? null,
  }),
);
