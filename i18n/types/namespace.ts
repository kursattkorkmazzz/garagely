export const TranslationNamespaces = {
  COMMON: "common",
  ERRORS: "errors",
  LANGUAGES: "languages",
  SETTINGS: "settings",
} as const;

export type TranslationNamespace =
  (typeof TranslationNamespaces)[keyof typeof TranslationNamespaces];
