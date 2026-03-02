import type { VehicleBrandModel } from "@garagely/shared/models/vehicle";

export interface IVehicleBrandRepository {
  findAll(): Promise<VehicleBrandModel[]>;
  findById(id: string): Promise<VehicleBrandModel | null>;
  findSystemBrands(): Promise<VehicleBrandModel[]>;
}
