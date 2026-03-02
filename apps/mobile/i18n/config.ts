import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en_common from "./locales/en/common.json";
import en_auth from "./locales/en/auth.json";
import en_backend from "./locales/en/backend.json";
import tr_common from "./locales/tr/common.json";
import tr_auth from "./locales/tr/auth.json";
import tr_backend from "./locales/tr/backend.json";

import type { Language } from "./types";

const LANGUAGE_STORAGE_KEY = "@garagely/language";

const resources = {
  en: {
    common: en_common,
    auth: en_auth,
    backend: en_backend,
  },
  tr: {
    common: tr_common,
    auth: tr_auth,
    backend: tr_backend,
  },
};

export const supportedLanguages: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "tr", label: "Türkçe" },
];

function getDeviceLanguage(): Language {
  const deviceLocale = Localization.getLocales()[0]?.languageCode;
  if (deviceLocale === "tr") {
    return "tr";
  }
  return "en";
}

export async function initI18n(): Promise<void> {
  let storedLanguage: Language | null = null;

  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === "en" || stored === "tr") {
      storedLanguage = stored;
    }
  } catch {
    // Ignore storage errors, will use device language
  }

  const language = storedLanguage ?? getDeviceLanguage();

  await i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: "en",
    defaultNS: "common",
    ns: ["common", "auth", "backend"],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
}

export async function changeLanguage(language: Language): Promise<void> {
  await i18n.changeLanguage(language);
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore storage errors
  }
}

export function getCurrentLanguage(): Language {
  return (i18n.language as Language) || "en";
}

export default i18n;
