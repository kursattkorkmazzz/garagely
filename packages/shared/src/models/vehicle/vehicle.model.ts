import * as yup from "yup";
import { firestoreDate } from "../../validators/firestore-date";
import {
  documentModelValidator,
  type DocumentModel,
} from "../document/index";

export const vehicleModelValidator = yup.object({
  id: yup.string().required(),
  userId: yup.string().required(),
  vehicleFuelTypeId: yup.string().required(),
  vehicleTransmissionTypeId: yup.string().required(),
  vehicleBodyTypeId: yup.string().required(),
  vehicleBrandId: yup.string().required(),
  vehicleModelId: yup.string().required(),
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
});

export type VehicleModel = yup.InferType<typeof vehicleModelValidator>;

export { DocumentModel };
