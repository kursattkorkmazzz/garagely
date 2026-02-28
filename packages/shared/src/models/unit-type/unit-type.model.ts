import * as yup from "yup";

export enum UnitType {
  DISTANCE = "distance",
  VOLUME = "volume",
  AREA = "area",
}

export const unitTypeValidator = yup
  .string()
  .oneOf(Object.values(UnitType) as UnitType[])
  .required();
