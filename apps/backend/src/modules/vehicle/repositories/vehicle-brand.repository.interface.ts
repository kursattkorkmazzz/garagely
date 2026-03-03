import type { VehicleBrandModel } from "@garagely/shared/models/vehicle";

export interface IVehicleBrandRepository<Tx = {}> {
  findAll(tx?: Tx): Promise<VehicleBrandModel[]>;
  findById(id: string, tx?: Tx): Promise<VehicleBrandModel | null>;
  findByNameLower(
    nameLower: string,
    tx?: Tx,
  ): Promise<VehicleBrandModel | null>;
  findSystemBrands(tx?: Tx): Promise<VehicleBrandModel[]>;
  create(
    data: Omit<VehicleBrandModel, "id">,
    tx?: Tx,
  ): Promise<VehicleBrandModel>;
}
