import * as yup from "yup";

export enum DistanceUnit {
  KM = "km",
  MILES = "miles",
}

export const distanceUnitValidator = yup
  .string()
  .oneOf(Object.values(DistanceUnit) as DistanceUnit[])
  .required();
