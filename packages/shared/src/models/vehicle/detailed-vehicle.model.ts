import * as yup from "yup";
import { firestoreDate } from "../../validators/firestore-date";
import { documentModelValidator } from "../document";
import { vehicleBrandModelValidator } from "./vehicle-brand.model";
import { vehicleModelModelValidator } from "./vehicle-model.model";
import { vehicleFuelTypeModelValidator } from "./vehicle-fuel-type.model";
import { vehicleTransmissionTypeModelValidator } from "./vehicle-transmission-type.model";
import { vehicleBodyTypeModelValidator } from "./vehicle-body-type.model";

export const detailedVehicleModelValidator = yup.object({
  // Vehicle core fields
  id: yup.string().required(),
  userId: yup.string().required(),
  color: yup.string().nullable().defined(),
  plate: yup.string().nullable().defined(),
  vin: yup.string().nullable().defined(),
  currentKm: yup.number().integer().min(0).nullable().defined(),
  coverPhoto: documentModelValidator.nullable().defined(),
  purchaseDate: firestoreDate().nullable().defined(),
  purchasePrice: yup.number().min(0).nullable().defined(),
  purchaseKm: yup.number().integer().min(0).nullable().defined(),
  createdAt: firestoreDate().required(),
  updatedAt: firestoreDate().required(),

  // Embedded related models
  brand: vehicleBrandModelValidator.required(),
  model: vehicleModelModelValidator.required(),
  fuelType: vehicleFuelTypeModelValidator.required(),
  transmissionType: vehicleTransmissionTypeModelValidator.required(),
  bodyType: vehicleBodyTypeModelValidator.required(),
});

export type DetailedVehicleModel = yup.InferType<
  typeof detailedVehicleModelValidator
>;
