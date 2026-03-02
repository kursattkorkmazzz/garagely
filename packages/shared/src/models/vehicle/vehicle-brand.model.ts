import * as yup from "yup";

export const vehicleBrandModelValidator = yup.object({
  id: yup.string().required(),
  name: yup.string().required(),
  logoUrl: yup.string().url().nullable().defined(),
  isSystem: yup.boolean().required(),
  isActive: yup.boolean().required(),
});

export type VehicleBrandModel = yup.InferType<typeof vehicleBrandModelValidator>;
