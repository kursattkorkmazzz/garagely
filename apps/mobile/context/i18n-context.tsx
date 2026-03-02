import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
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
import { useStore } from "@/stores";

export interface I18nContextProps {
  language: Language;
  changeLanguage: (language: Language) => Promise<void>;
  supportedLanguages: { code: Language; label: string }[];
  isReady: boolean;
  isUpdating: boolean;
}

const I18nContext = createContext<I18nContextProps>({
  language: "en",
  changeLanguage: async () => {},
  supportedLanguages: [],
  isReady: false,
  isUpdating: false,
});

export const useI18nContext = () => useContext(I18nContext);

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(getCurrentLanguage());
  const [isReady, setIsReady] = useState(false);

  const user = useStore((state) => state.auth.user);
  const updatePreferences = useStore((state) => state.preferences.updatePreferences);
  const updateUserPreferences = useStore((state) => state.auth.updateUserPreferences);
  const isUpdating = useStore((state) => state.preferences.isUpdating);

  useEffect(() => {
    initI18n().then(() => {
      setLanguage(getCurrentLanguage());
      setIsReady(true);
    });
  }, []);

  // Sync language from user preferences
  useEffect(() => {
    if (isReady && user?.preferences?.locale) {
      const userLocale = user.preferences.locale as Language;
      if (supportedLanguages.some((lang) => lang.code === userLocale)) {
        changeI18nLanguage(userLocale);
        setLanguage(userLocale);
      }
    }
  }, [isReady, user?.preferences?.locale]);

  const changeLanguage = useCallback(
    async (newLanguage: Language) => {
      await changeI18nLanguage(newLanguage);
      setLanguage(newLanguage);

      // Update backend if user is authenticated
      if (user) {
        await updatePreferences(
          { locale: newLanguage },
          {
            onSuccess: (preferences) => {
              updateUserPreferences(preferences);
            },
          },
        );
      }
    },
    [user, updatePreferences, updateUserPreferences],
  );

  const value = useMemo(
    () => ({
      language,
      changeLanguage,
      supportedLanguages,
      isReady,
      isUpdating,
    }),
    [language, changeLanguage, isReady, isUpdating],
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
