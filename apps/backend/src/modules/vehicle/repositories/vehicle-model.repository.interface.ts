import type { VehicleModelModel } from "@garagely/shared/models/vehicle";
import type { CreateVehicleModelPayload } from "@garagely/shared/payloads/vehicle";

export interface IVehicleModelRepository {
  findById(id: string): Promise<VehicleModelModel | null>;
  findByBrandId(brandId: string): Promise<VehicleModelModel[]>;
  findByBrandNameYear(
    brandId: string,
    nameLower: string,
    year: number | null | undefined
  ): Promise<VehicleModelModel | null>;
  create(data: CreateVehicleModelPayload & { isSystem: boolean; isActive: boolean }): Promise<VehicleModelModel>;
}
