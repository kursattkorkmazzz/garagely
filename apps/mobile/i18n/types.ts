import type en_common from "./locales/en/common.json";
import type en_auth from "./locales/en/auth.json";
import type en_backend from "./locales/en/backend.json";
import type en_fuel_types from "./locales/en/fuel_types.json";
import type en_vehicles from "./locales/en/vehicles.json";
export type Language = "en" | "tr";

export type TranslationNamespace =
  | "common"
  | "auth"
  | "backend"
  | "fuel_types"
  | "vehicles";

export interface TranslationResources {
  common: typeof en_common;
  auth: typeof en_auth;
  backend: typeof en_backend;
  fuelTypes: typeof en_fuel_types;
  vehicles: typeof en_vehicles;
}

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: TranslationResources;
  }
}
