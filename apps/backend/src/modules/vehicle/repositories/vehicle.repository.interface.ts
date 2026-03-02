import type { VehicleModel } from "@garagely/shared/models/vehicle";
import type {
  CreateVehiclePayload,
  UpdateVehiclePayload,
} from "@garagely/shared/payloads/vehicle";

export interface IVehicleRepository {
  findById(id: string): Promise<VehicleModel | null>;
  findByUserId(userId: string): Promise<VehicleModel[]>;
  create(userId: string, data: CreateVehiclePayload): Promise<VehicleModel>;
  update(id: string, data: UpdateVehiclePayload): Promise<VehicleModel>;
  delete(id: string): Promise<void>;
}
