import type en_common from "./locales/en/common.json";
import type en_auth from "./locales/en/auth.json";
import type en_errors from "./locales/en/errors.json";
import type en_fuel_types from "./locales/en/fuel_types.json";
import type en_vehicles from "./locales/en/vehicles.json";
import type en_dates from "./locales/en/dates.json";
export type Language = "en" | "tr";

export type TranslationNamespace =
  | "common"
  | "auth"
  | "errors"
  | "fuel_types"
  | "vehicles"
  | "dates";

export interface TranslationResources {
  common: typeof en_common;
  auth: typeof en_auth;
  errors: typeof en_errors;
  fuel_types: typeof en_fuel_types;
  vehicles: typeof en_vehicles;
  dates: typeof en_dates;
}

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: TranslationResources;
  }
}
