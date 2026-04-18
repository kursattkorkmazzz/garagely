import { Languages } from "@/shared/languages";

import en_errors from "@/i18n/locales/en/errors.json";
import en_languages from "@/i18n/locales/en/languages.json";
import en_settings from "@/i18n/locales/en/settings.json";
import en_units from "@/i18n/locales/en/units.json";

import tr_errors from "@/i18n/locales/tr/errors.json";
import tr_languages from "@/i18n/locales/tr/languages.json";
import tr_settings from "@/i18n/locales/tr/settings.json";
import tr_units from "@/i18n/locales/tr/units.json";

export const LanguageResources = {
  [Languages.EN]: {
    errors: en_errors,
    languages: en_languages,
    settings: en_settings,
    units: en_units,
  },
  [Languages.TR]: {
    errors: tr_errors,
    languages: tr_languages,
    settings: tr_settings,
    units: tr_units,
  },
} as const;
