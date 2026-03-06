import * as yup from "yup";

export const vehicleBodyTypeModelValidator = yup.object({
  id: yup.string().required(),
  type: yup.string().required(),
  icon: yup.string().required(),
  isActive: yup.boolean().required(),
});

export type VehicleBodyTypeModel = yup.InferType<
  typeof vehicleBodyTypeModelValidator
>;
