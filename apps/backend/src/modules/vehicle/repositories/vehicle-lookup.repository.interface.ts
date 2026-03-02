import type {
  VehicleTransmissionTypeModel,
  VehicleBodyTypeModel,
  VehicleFuelTypeModel,
} from "@garagely/shared/models/vehicle";

export interface IVehicleLookupRepository {
  findAllTransmissionTypes(): Promise<VehicleTransmissionTypeModel[]>;
  findTransmissionTypeById(id: string): Promise<VehicleTransmissionTypeModel | null>;
  findAllBodyTypes(): Promise<VehicleBodyTypeModel[]>;
  findBodyTypeById(id: string): Promise<VehicleBodyTypeModel | null>;
  findAllFuelTypes(): Promise<VehicleFuelTypeModel[]>;
  findFuelTypeById(id: string): Promise<VehicleFuelTypeModel | null>;
}
