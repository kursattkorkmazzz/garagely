import * as yup from "yup";

export const createVehicleModelPayloadValidator = yup.object({
  brandId: yup.string().required(),
  name: yup.string().min(1).max(100).required(),
  year: yup.number().integer().min(1900).max(2100).nullable(),
});

export type CreateVehicleModelPayload = yup.InferType<
  typeof createVehicleModelPayloadValidator
>;
