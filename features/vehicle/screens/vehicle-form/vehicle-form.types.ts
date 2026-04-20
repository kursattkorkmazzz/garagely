import { type BodyType } from "@/shared/enums/body-type";
import { type FuelType } from "@/shared/enums/fuel-type";
import { type TransmissionType } from "@/shared/enums/transmission-type";
import { type CurrencyType } from "@/shared/currency";

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
};

export const VEHICLE_FORM_EMPTY: VehicleFormValues = {
  brand: "",
  model: "",
  year: "",
  plate: "",
  color: "",
  transmissionType: "",
  bodyType: "",
  fuelType: "",
  purchaseAmount: "",
  purchaseCurrency: "",
  purchaseDate: null,
};
