import * as yup from "yup";

export enum DistanceUnit {
  KM = "km",
  MI = "mi",
}

// SI base unit is meters
export const DISTANCE_TO_METERS: Record<DistanceUnit, number> = {
  [DistanceUnit.KM]: 1000,
  [DistanceUnit.MI]: 1609.344,
};

export const DISTANCE_LABELS: Record<DistanceUnit, string> = {
  [DistanceUnit.KM]: "Kilometers",
  [DistanceUnit.MI]: "Miles",
};

export const distanceUnitValidator = yup
  .string()
  .oneOf(Object.values(DistanceUnit) as DistanceUnit[])
  .required();
