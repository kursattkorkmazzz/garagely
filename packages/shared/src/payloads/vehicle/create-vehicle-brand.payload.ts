import * as yup from "yup";

export const createVehicleBrandPayloadValidator = yup.object({
  name: yup.string().min(1).max(100).required(),
});

export type CreateVehicleBrandPayload = yup.InferType<
  typeof createVehicleBrandPayloadValidator
>;
