import * as yup from "yup";

export const vehicleFuelTypeModelValidator = yup.object({
  id: yup.string().required(),
  type: yup.string().required(),
  icon: yup.string().nullable().defined(),
  isActive: yup.boolean().required(),
});

export type VehicleFuelTypeModel = yup.InferType<typeof vehicleFuelTypeModelValidator>;
