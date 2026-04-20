export const TranslationNamespaces = {
  COMMON: "common",
  ERRORS: "errors",
  LANGUAGES: "languages",
  SETTINGS: "settings",
  UNITS: "units",
  CURRENCY: "currency",
  THEME: "theme",
  GARAGE: "garage",
} as const;

export type TranslationNamespace =
  (typeof TranslationNamespaces)[keyof typeof TranslationNamespaces];
