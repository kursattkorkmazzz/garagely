import type en_common from "./locales/en/common.json";
import type en_auth from "./locales/en/auth.json";

export type Language = "en" | "tr";

export type TranslationNamespace = "common" | "auth";

export interface TranslationResources {
  common: typeof en_common;
  auth: typeof en_auth;
}

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: TranslationResources;
  }
}
