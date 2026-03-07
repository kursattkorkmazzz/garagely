import * as yup from "yup";

export enum EntityType {
  USER_PROFILE = "user_profile",
  VEHICLE_COVER = "vehicle_cover",
  VEHICLE_INTERIOR = "vehicle_interior",
  VEHICLE_BACK = "vehicle_back",
  VEHICLE_SIDE = "vehicle_side",
  VEHICLE_FRONT = "vehicle_front",
  VEHICLE_MOTOR = "vehicle_motor",
  VEHICLE_TIRES = "vehicle_tires",
  VEHICLE_OTHER = "vehicle_other",
}

export const entityTypeValidator = yup
  .string()
  .oneOf(Object.values(EntityType) as EntityType[])
  .required();
