import { TranslationNamespaces } from "@/i18n/types/namespace";
import { AppError } from "@/shared/errors/app-error";
import { GlobalErrors } from "@/shared/errors/global.errors";
import i18next from "i18next";
import Toast from "react-native-toast-message";

export function handleUIError(error: unknown) {
  if (error instanceof AppError) {
    const errorMessage = i18next.t(error.errorCode, {
      ns: TranslationNamespaces.ERRORS,
      defaultValue: GlobalErrors.UNKNOWN_ERROR,
    });
    Toast.show({
      type: "error",
      text1: errorMessage,
    });
    return;
  }

  // Default shows unknown error message.
  const defaultMessage = i18next.t(GlobalErrors.UNKNOWN_ERROR, {
    ns: TranslationNamespaces.ERRORS,
  });

  Toast.show({
    type: "error",
    text1: defaultMessage,
  });
}
