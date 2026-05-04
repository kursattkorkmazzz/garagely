import { type CurrencyType } from "@/shared/currency";
import { BodyTypes, type BodyType } from "@/shared/enums/body-type";
import { FuelTypes, type FuelType } from "@/shared/enums/fuel-type";
import {
  TransmissionTypes,
  type TransmissionType,
} from "@/shared/enums/transmission-type";

export type VehicleFormValues = {
  brand: string;
  model: string;
  year: string;
  plate: string;
  color: string;
  transmissionType: TransmissionType | "";
  bodyType: BodyType | "";
  fuelType: FuelType | "";
  purchaseAmount: string;
  purchaseCurrency: CurrencyType | "";
  purchaseDate: number | null;
  coverPhotoAssetId: string | null;
  /** Sadece gösterim için. Servise gönderilmez. */
  coverPhotoPreviewUri: string | null;
};

//TODO: Remove this at production, only for development and testing purposes
export const VEHICLE_FORM_EMPTY: VehicleFormValues = {
  brand: "Mitsubishi",
  model: "Carisma Avence",
  year: "2003",
  plate: "06 DJR 415",
  color: "#FF0000",
  transmissionType: TransmissionTypes.AUTOMATIC,
  bodyType: BodyTypes.SEDAN,
  fuelType: FuelTypes.LPG,
  purchaseAmount: "165000",
  purchaseCurrency: "TRY",
  purchaseDate: null,
  coverPhotoAssetId: null,
  coverPhotoPreviewUri: null,
};
