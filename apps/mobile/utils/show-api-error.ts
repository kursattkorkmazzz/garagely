import i18n from "@/i18n/config";
import { appToast } from "@/components/ui/app-toast";
import { ErrorCode } from "@garagely/shared/error.codes";
import type { SdkError } from "@garagely/api-sdk";

/**
 * Shows an error toast for SDK errors with localized messages.
 *
 * Handles both validation errors (with field-level details) and general errors.
 * Uses i18n directly - no need to pass translation function.
 *
 * @example
 * ```ts
 * sdk.vehicle.createVehicle(payload, {
 *   onSuccess: (data) => { ... },
 *   onError: showApiError,  // Just pass the function
 * });
 * ```
 */
export function showApiError(error: SdkError): void {
  const message = getErrorMessage(error);
  appToast.error(message);
}

/**
 * Gets localized error message without showing toast.
 * Useful when you need the message for custom handling.
 */
export function getApiErrorMessage(error: SdkError): string {
  return getErrorMessage(error);
}

function getErrorMessage(error: SdkError): string {
  // 1. Handle validation errors with field-level details
  if (error.code === ErrorCode.VALIDATION_ERROR && error.details) {
    const validationMsg = getValidationMessage(error.details);
    if (validationMsg) return validationMsg;
  }

  // 2. Try to get localized message for error code
  const localized = i18n.t(`errors:codes.${error.code}`, { defaultValue: "" });
  if (localized && localized !== `errors:codes.${error.code}`) {
    return localized;
  }

  // 3. Fall back to error.message from server
  if (error.message) {
    return error.message;
  }

  // 4. Final fallback
  return i18n.t("errors:generic", { defaultValue: "Something went wrong." });
}

function getValidationMessage(
  details: Record<string, string[]>,
): string | null {
  const entries = Object.entries(details);
  if (entries.length === 0) return null;

  // Get first field and first error
  const [field, errors] = entries[0];
  if (!errors || errors.length === 0) return null;

  const errorCode = errors[0];

  // Try to get localized field name
  const fieldName = i18n.t(`errors:fields.${field}`, { defaultValue: "" });

  // Try to get localized error message (error code lookup)
  const localizedError = i18n.t(`errors:codes.${errorCode}`, {
    defaultValue: "",
  });

  // Use localized error or raw error code/message
  const errorMsg =
    localizedError && localizedError !== `errors:codes.${errorCode}`
      ? localizedError
      : errorCode;

  // Format: "Field Name: Error message" or just "Error message"
  if (fieldName && fieldName !== `errors:fields.${field}`) {
    return `${fieldName}: ${errorMsg}`;
  }

  return errorMsg;
}
