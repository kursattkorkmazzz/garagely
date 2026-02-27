import { AppError } from "@garagely/shared/error.types";
import type {
  FirebaseAuthErrorCode,
  FirebaseError,
} from "./firebase-error.types";
import { firebaseAuthErrorMappings } from "./firebase-error.mappings";

/**
 * Type guard to check if an error is a Firebase error with a code property
 */
export function isFirebaseError(error: unknown): error is FirebaseError {
  return (
    error instanceof Error &&
    "code" in error &&
    typeof (error as FirebaseError).code === "string"
  );
}

/**
 * Convert a Firebase error to the appropriate AppError subclass.
 * If no mapping exists, returns undefined to allow fallback to default error handling.
 */
export function convertFirebaseError(error: FirebaseError): AppError | undefined {
  const mapping =
    firebaseAuthErrorMappings[error.code as FirebaseAuthErrorCode];

  if (mapping) {
    return new mapping.errorClass(mapping.message);
  }

  return undefined;
}
