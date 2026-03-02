import * as yup from "yup";

export const vehicleTransmissionTypeModelValidator = yup.object({
  id: yup.string().required(),
  type: yup.string().required(),
  icon: yup.string().nullable().defined(),
  isActive: yup.boolean().required(),
});

export type VehicleTransmissionTypeModel = yup.InferType<typeof vehicleTransmissionTypeModelValidator>;
