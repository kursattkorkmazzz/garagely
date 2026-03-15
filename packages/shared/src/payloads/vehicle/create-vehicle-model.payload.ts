import * as yup from "yup";
import { vehicleModelYearValidator } from "../../models/vehicle/vehicle-model.model";

export const createVehicleModelPayloadValidator = yup.object({
  brandId: yup.string().required(),
  name: yup.string().min(1).max(100).required(),
  year: vehicleModelYearValidator,
});

export type CreateVehicleModelPayload = yup.InferType<
  typeof createVehicleModelPayloadValidator
>;
