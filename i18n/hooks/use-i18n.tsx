import {
  TranslationNamespace,
  TranslationNamespaces,
} from "@/i18n/types/namespace";
import { useTranslation } from "react-i18next";

export function useI18n(
  ns:
    | TranslationNamespace
    | TranslationNamespace[] = TranslationNamespaces.COMMON,
) {
  const { t, i18n } = useTranslation(ns);
  return {
    t,
    language: i18n.language,
    changeLanguage: i18n.changeLanguage,
  };
}
