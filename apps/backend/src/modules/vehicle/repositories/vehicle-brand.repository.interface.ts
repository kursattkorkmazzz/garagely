import type { VehicleBrandModel } from "@garagely/shared/models/vehicle";

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export interface IVehicleBrandRepository<Tx = {}> {
  findAll(tx?: Tx): Promise<VehicleBrandModel[]>;
  findById(id: string, tx?: Tx): Promise<VehicleBrandModel | null>;
  findByNameLower(
    nameLower: string,
    tx?: Tx,
  ): Promise<VehicleBrandModel | null>;
  findSystemBrands(tx?: Tx): Promise<VehicleBrandModel[]>;
  findSystemBrandsPaginated(
    page: number,
    pageSize: number,
    tx?: Tx,
  ): Promise<PaginatedResult<VehicleBrandModel>>;
  searchByName(search: string, tx?: Tx): Promise<VehicleBrandModel[]>;
  searchByNamePaginated(
    search: string,
    page: number,
    pageSize: number,
    tx?: Tx,
  ): Promise<PaginatedResult<VehicleBrandModel>>;
  create(
    data: Omit<VehicleBrandModel, "id">,
    tx?: Tx,
  ): Promise<VehicleBrandModel>;
}
