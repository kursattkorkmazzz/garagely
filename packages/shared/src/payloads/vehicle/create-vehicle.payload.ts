import * as yup from "yup";

export const createVehiclePayloadValidator = yup.object({
  vehicleFuelTypeId: yup.string().required(),
  vehicleTransmissionTypeId: yup.string().required(),
  vehicleBodyTypeId: yup.string().required(),
  vehicleBrandId: yup.string().required(),
  vehicleModelId: yup.string().required(),
  color: yup.string().nullable(),
  plate: yup.string().nullable(),
  vin: yup.string().nullable(),
  currentKm: yup.number().integer().min(0).nullable(),
  purchaseDate: yup.date().nullable(),
  purchasePrice: yup.number().min(0).nullable(),
  purchaseKm: yup.number().integer().min(0).nullable(),
});

export type CreateVehiclePayload = yup.InferType<typeof createVehiclePayloadValidator>;
