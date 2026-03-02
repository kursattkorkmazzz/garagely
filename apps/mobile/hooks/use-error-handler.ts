import { useCallback } from "react";
import { useI18n } from "./use-i18n";
import { appToast } from "@/components/ui/app-toast";
import type { ErrorCode } from "@garagely/shared/error.codes";

interface SdkError {
  code: ErrorCode;
  message: string;
  details?: Record<string, string[]>;
}

/**
 * Hook that provides localized error handling for SDK errors.
 * Maps error codes to translated messages.
 */
export function useErrorHandler() {
  const { t } = useI18n(["common", "backend"]);

  /**
   * Get localized error message for an error code.
   * Falls back to the original message if no translation exists.
   */
  const getErrorMessage = useCallback(
    (error: SdkError): string => {
      // Try to get localized message for the error code from backend namespace
      const localizedMessage = t(`backend:${error.code}`, {
        defaultValue: "",
      });

      // Return localized message if it exists, otherwise fall back to original
      if (localizedMessage && localizedMessage !== `backend:${error.code}`) {
        return localizedMessage;
      }

      // Fall back to generic error if no translation and no message
      return error.message || t("common:errors.generic");
    },
    [t],
  );

  /**
   * Show error toast with localized message.
   */
  const showError = useCallback(
    (error: SdkError) => {
      const message = getErrorMessage(error);
      appToast.error(message);
    },
    [getErrorMessage],
  );

  /**
   * Create an onError callback that shows localized error toast.
   * Use this as the onError callback for SDK calls.
   */
  const handleError = useCallback(
    (error: SdkError) => {
      showError(error);
    },
    [showError],
  );

  return {
    getErrorMessage,
    showError,
    handleError,
  };
}

/**
 * Utility function to get localized error message without hook.
 * Use this in non-component contexts.
 */
export function getLocalizedErrorMessage(
  error: SdkError,
  t: (key: string, options?: { defaultValue?: string }) => string,
): string {
  const localizedMessage = t(`backend:${error.code}`, { defaultValue: "" });

  if (localizedMessage && localizedMessage !== `backend:${error.code}`) {
    return localizedMessage;
  }

  return error.message || t("common:errors.generic");
}
