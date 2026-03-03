import type { VehicleModelModel } from "@garagely/shared/models/vehicle";
import { CreateVehicleModelPayload } from "@garagely/shared/payloads/vehicle";

export interface IVehicleModelRepository<Tx = {}> {
  findById(id: string, tx?: Tx): Promise<VehicleModelModel | null>;
  findByBrandId(brandId: string, tx?: Tx): Promise<VehicleModelModel[]>;
  findByBrandNameYear(
    brandId: string,
    nameLower: string,
    year: number | null | undefined,
    tx?: Tx,
  ): Promise<VehicleModelModel | null>;
  create(
    data: Omit<VehicleModelModel, "id">,
    tx?: Tx,
  ): Promise<VehicleModelModel>;
}
