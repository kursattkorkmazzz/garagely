import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { I18nextProvider } from "react-i18next";
import i18n, {
  initI18n,
  changeLanguage as changeI18nLanguage,
  getCurrentLanguage,
  supportedLanguages,
} from "@/i18n/config";
import type { Language } from "@/i18n/types";

export interface I18nContextProps {
  language: Language;
  changeLanguage: (language: Language) => Promise<void>;
  supportedLanguages: { code: Language; label: string }[];
  isReady: boolean;
}

const I18nContext = createContext<I18nContextProps>({
  language: "en",
  changeLanguage: async () => {},
  supportedLanguages: [],
  isReady: false,
});

export const useI18nContext = () => useContext(I18nContext);

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(getCurrentLanguage());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => {
      setLanguage(getCurrentLanguage());
      setIsReady(true);
    });
  }, []);

  const changeLanguage = async (newLanguage: Language) => {
    await changeI18nLanguage(newLanguage);
    setLanguage(newLanguage);
  };

  const value = useMemo(
    () => ({
      language,
      changeLanguage,
      supportedLanguages,
      isReady,
    }),
    [language, isReady],
  );

  if (!isReady) {
    return null;
  }

  return (
    <I18nContext.Provider value={value}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </I18nContext.Provider>
  );
};
