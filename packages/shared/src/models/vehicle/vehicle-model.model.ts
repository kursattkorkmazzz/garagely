import * as yup from "yup";

export const vehicleModelModelValidator = yup.object({
  id: yup.string().required(),
  brandId: yup.string().required(),
  name: yup.string().required(),
  coverPhotoUrl: yup.string().url().nullable().defined(),
  year: yup.number().integer().min(1900).max(2100).nullable().defined(),
  isSystem: yup.boolean().required(),
  isActive: yup.boolean().required(),
});

export type VehicleModelModel = yup.InferType<typeof vehicleModelModelValidator>;
