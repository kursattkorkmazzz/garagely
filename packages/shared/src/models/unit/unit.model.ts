import * as yup from "yup";
import { UnitType, unitTypeValidator } from "../unit-type";

export const unitModelValidator = yup.object({
  id: yup.string().required(),
  unitType: unitTypeValidator,
  unit: yup.string().required(),
  value: yup.string().required(),
});

export type UnitModel = yup.InferType<typeof unitModelValidator>;

export { UnitType };
