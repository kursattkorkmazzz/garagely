import * as yup from "yup";

export function getCurrentYear(): number {
  return new Date(Date.now()).getFullYear();
}

export const VEHICLE_MODEL_YEAR_MIN = 1900;

export const vehicleModelYearValidator = yup
  .number()
  .typeError("YEAR_TYPE_ERROR")
  .integer("YEAR_INTEGER")
  .min(VEHICLE_MODEL_YEAR_MIN, "YEAR_MIN")
  .max(getCurrentYear(), "YEAR_MAX")
  .nullable()
  .defined();

export const vehicleModelModelValidator = yup.object({
  id: yup.string().required(),
  brandId: yup.string().required(),
  name: yup.string().required(),
  coverPhotoUrl: yup.string().url().nullable().defined(),
  year: vehicleModelYearValidator,
  isSystem: yup.boolean().required(),
  isActive: yup.boolean().required(),
});

export type VehicleModelModel = yup.InferType<
  typeof vehicleModelModelValidator
>;
