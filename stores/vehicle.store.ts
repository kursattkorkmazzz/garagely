import { UserPreferencesService } from "@/features/user-preferences/user-preferences.service";
import { Vehicle } from "@/features/vehicle/entity/vehicle.entity";
import {
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleService,
} from "@/features/vehicle/service/vehicle.service";
import { create } from "zustand";

interface VehicleState {
  vehicles: Vehicle[];
  activeVehicleId: string | null;
  isLoading: boolean;
}

interface VehicleActions {
  load: () => Promise<void>;
  create: (dto: CreateVehicleDto) => Promise<void>;
  update: (id: string, dto: UpdateVehicleDto) => Promise<void>;
  delete: (id: string) => Promise<void>;
  setActiveVehicle: (id: string) => Promise<void>;
  getActiveVehicle: () => Vehicle | null;
}

export const useVehicleStore = create<VehicleState & VehicleActions>()(
  (set, get) => ({
    vehicles: [],
    activeVehicleId: null,
    isLoading: false,

    load: async () => {
      set({ isLoading: true });
      const [vehicles, prefs] = await Promise.all([
        VehicleService.getAll(),
        UserPreferencesService.getOrCreate(),
      ]);
      set({
        vehicles,
        activeVehicleId: prefs.activeVehicleId ?? null,
        isLoading: false,
      });
    },

    create: async (dto) => {
      const vehicle = await VehicleService.create(dto);
      set((s) => ({ vehicles: [vehicle, ...s.vehicles] }));
    },

    update: async (id, dto) => {
      const updated = await VehicleService.update(id, dto);
      set((s) => ({
        vehicles: s.vehicles.map((v) => (v.id === id ? updated : v)),
      }));
    },

    delete: async (id) => {
      await VehicleService.delete(id);
      const wasActive = get().activeVehicleId === id;
      set((s) => ({
        vehicles: s.vehicles.filter((v) => v.id !== id),
        activeVehicleId: wasActive ? null : s.activeVehicleId,
      }));
      if (wasActive) {
        await UserPreferencesService.update({ activeVehicleId: undefined });
      }
    },

    setActiveVehicle: async (id) => {
      set({ activeVehicleId: id });
      await UserPreferencesService.update({ activeVehicleId: id });
    },

    getActiveVehicle: () => {
      const { vehicles, activeVehicleId } = get();
      return vehicles.find((v) => v.id === activeVehicleId) ?? null;
    },
  })
);
