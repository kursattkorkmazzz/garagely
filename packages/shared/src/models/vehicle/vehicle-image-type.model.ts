import { EntityType } from "../entity-type";

export enum VehicleImageType {
  COVER = "cover",
  INTERIOR = "interior",
  BACK = "back",
  SIDE = "side",
  FRONT = "front",
  MOTOR = "motor",
  TIRES = "tires",
  OTHER = "other",
}

export const vehicleImageTypeToEntityType: Record<VehicleImageType, EntityType> = {
  [VehicleImageType.COVER]: EntityType.VEHICLE_COVER,
  [VehicleImageType.INTERIOR]: EntityType.VEHICLE_INTERIOR,
  [VehicleImageType.BACK]: EntityType.VEHICLE_BACK,
  [VehicleImageType.SIDE]: EntityType.VEHICLE_SIDE,
  [VehicleImageType.FRONT]: EntityType.VEHICLE_FRONT,
  [VehicleImageType.MOTOR]: EntityType.VEHICLE_MOTOR,
  [VehicleImageType.TIRES]: EntityType.VEHICLE_TIRES,
  [VehicleImageType.OTHER]: EntityType.VEHICLE_OTHER,
};
