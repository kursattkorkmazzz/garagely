import en_errors from "@/i18n/locales/en/errors.json";
import tr_errors from "@/i18n/locales/tr/errors.json";
import { Languages } from "@/shared/languages";

export const LanguageResources = {
  [Languages.EN]: {
    errors: en_errors,
  },
  [Languages.TR]: {
    errors: tr_errors,
  },
} as const;
