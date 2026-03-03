import * as yup from "yup";
import { VehicleBrandModel, VehicleModelModel } from "../../models/vehicle";
import { createVehicleBrandPayloadValidator } from "./create-vehicle-brand.payload";
import { createVehicleModelPayloadValidator } from "./create-vehicle-model.payload";

export const upsertBrandModelPayloadValidator = yup.object({
  brand: createVehicleBrandPayloadValidator.required(),
  model: createVehicleModelPayloadValidator.omit(["brandId"]).required(),
});

export type UpsertBrandModelPayload = yup.InferType<
  typeof upsertBrandModelPayloadValidator
>;

export type UpsertBrandModelResponse = {
  brand: VehicleBrandModel;
  model: VehicleModelModel;
};
