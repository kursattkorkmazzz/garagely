import type { VehicleModelModel } from "@garagely/shared/models/vehicle";
import { CreateVehicleModelPayload } from "@garagely/shared/payloads/vehicle";
import type { PaginatedResult } from "./vehicle-brand.repository.interface";

export interface IVehicleModelRepository<Tx = {}> {
  findById(id: string, tx?: Tx): Promise<VehicleModelModel | null>;
  findByBrandId(brandId: string, tx?: Tx): Promise<VehicleModelModel[]>;
  findByBrandIdPaginated(
    brandId: string,
    page: number,
    limit: number,
    tx?: Tx,
  ): Promise<PaginatedResult<VehicleModelModel>>;
  findByBrandNameYear(
    brandId: string,
    nameLower: string,
    year: number | null | undefined,
    tx?: Tx,
  ): Promise<VehicleModelModel | null>;
  searchByNameInBrand(
    brandId: string,
    search: string,
    tx?: Tx,
  ): Promise<VehicleModelModel[]>;
  searchByNameInBrandPaginated(
    brandId: string,
    search: string,
    page: number,
    limit: number,
    tx?: Tx,
  ): Promise<PaginatedResult<VehicleModelModel>>;
  create(
    data: Omit<VehicleModelModel, "id">,
    tx?: Tx,
  ): Promise<VehicleModelModel>;
}
