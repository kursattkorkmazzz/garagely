import { LanguageResources } from "@/i18n/types/language-resources";
import { TranslationNamespaces } from "@/i18n/types/namespace";
import { Language, Languages } from "@/shared/languages";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export class LocalizationService {
  static async initI18Next() {
    //TODO: Get the language from user preferences.

    //TODO: If not set, set the languages as EN as fallback.

    await i18n.use(initReactI18next).init({
      resources: LanguageResources,
      lng: Languages.EN,
      fallbackLng: Languages.EN,
      defaultNS: TranslationNamespaces.COMMON,
      ns: Object.values(TranslationNamespaces),
      interpolation: {
        escapeValue: false, // react already safes from xss
      },
      cleanCode: true,
      react: {
        useSuspense: false,
      },
    });
  }

  static changeLanguage(lang: Language): void {
    i18n.changeLanguage(lang);
  }
  static getCurrentLanguage(): Language {
    return i18n.language as Language;
  }
}
