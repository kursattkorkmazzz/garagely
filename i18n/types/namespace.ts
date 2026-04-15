export const TranslationNamespaces = {
  COMMON: "common",
  ERRORS: "errors",
} as const;

export type TranslationNamespace =
  (typeof TranslationNamespaces)[keyof typeof TranslationNamespaces];
