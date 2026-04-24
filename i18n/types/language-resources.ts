import { Languages } from "@/shared/languages";

import en_common from "@/i18n/locales/en/common.json";
import en_components from "@/i18n/locales/en/components.json";
import en_currency from "@/i18n/locales/en/currency.json";
import en_errors from "@/i18n/locales/en/errors.json";
import en_garage from "@/i18n/locales/en/garage.json";
import en_languages from "@/i18n/locales/en/languages.json";
import en_settings from "@/i18n/locales/en/settings.json";
import en_theme from "@/i18n/locales/en/theme.json";
import en_units from "@/i18n/locales/en/units.json";
import en_vehicle from "@/i18n/locales/en/vehicle.json";

import tr_common from "@/i18n/locales/tr/common.json";
import tr_components from "@/i18n/locales/tr/components.json";
import tr_currency from "@/i18n/locales/tr/currency.json";
import tr_errors from "@/i18n/locales/tr/errors.json";
import tr_garage from "@/i18n/locales/tr/garage.json";
import tr_languages from "@/i18n/locales/tr/languages.json";
import tr_settings from "@/i18n/locales/tr/settings.json";
import tr_theme from "@/i18n/locales/tr/theme.json";
import tr_units from "@/i18n/locales/tr/units.json";
import tr_vehicle from "@/i18n/locales/tr/vehicle.json";

export const LanguageResources = {
  [Languages.EN]: {
    common: en_common,
    errors: en_errors,
    languages: en_languages,
    settings: en_settings,
    units: en_units,
    currency: en_currency,
    theme: en_theme,
    garage: en_garage,
    vehicle: en_vehicle,
    components: en_components,
  },
  [Languages.TR]: {
    common: tr_common,
    errors: tr_errors,
    languages: tr_languages,
    settings: tr_settings,
    units: tr_units,
    currency: tr_currency,
    theme: tr_theme,
    garage: tr_garage,
    vehicle: tr_vehicle,
    components: tr_components,
  },
} as const;
