import * as yup from "yup";

export const updateVehiclePayloadValidator = yup.object({
  vehicleFuelTypeId: yup.string(),
  vehicleTransmissionTypeId: yup.string(),
  vehicleBodyTypeId: yup.string(),
  vehicleBrandId: yup.string(),
  vehicleModelId: yup.string(),
  color: yup.string().nullable(),
  plate: yup.string().nullable(),
  vin: yup.string().nullable(),
  currentKm: yup.number().integer().min(0).nullable(),
  purchaseDate: yup.date().nullable(),
  purchasePrice: yup.number().min(0).nullable(),
  purchaseKm: yup.number().integer().min(0).nullable(),
});

export type UpdateVehiclePayload = yup.InferType<typeof updateVehiclePayloadValidator>;
