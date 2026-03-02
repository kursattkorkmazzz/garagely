import * as yup from "yup";

export enum EntityType {
  USER_PROFILE = "user_profile",
  VEHICLE_COVER = "vehicle_cover",
}

export const entityTypeValidator = yup
  .string()
  .oneOf(Object.values(EntityType) as EntityType[])
  .required();
