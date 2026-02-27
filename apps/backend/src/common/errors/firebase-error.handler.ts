import { AppError } from "@garagely/shared/error.types";
import {
  ConflictError,
  ForbiddenError,
  InvalidCredentialsError,
  UnauthorizedError,
  ValidationError,
} from "@garagely/shared/error.types";

/**
 * Firebase error structure with code property
 */
export interface FirebaseError extends Error {
  code: string;
  codePrefix?: string;
}

/**
 * Configuration for mapping a Firebase error code to an AppError
 */
interface FirebaseErrorMapping {
  errorClass: new (message: string) => AppError;
  message: string;
}

/**
 * Maps Firebase Auth error codes to AppError subclasses with user-friendly messages
 * @see https://firebase.google.com/docs/auth/admin/errors
 */
const firebaseErrorMappings: Record<string, FirebaseErrorMapping> = {
  "auth/email-already-exists": {
    errorClass: ConflictError,
    message: "An account with this email already exists",
  },
  "auth/user-not-found": {
    errorClass: InvalidCredentialsError,
    message: "Invalid email or password",
  },
  "auth/invalid-password": {
    errorClass: InvalidCredentialsError,
    message: "Invalid email or password",
  },
  "auth/wrong-password": {
    errorClass: InvalidCredentialsError,
    message: "Invalid email or password",
  },
  "auth/invalid-credential": {
    errorClass: InvalidCredentialsError,
    message: "Invalid email or password",
  },
  "auth/invalid-id-token": {
    errorClass: UnauthorizedError,
    message: "Your session is invalid",
  },
  "auth/id-token-expired": {
    errorClass: UnauthorizedError,
    message: "Your session has expired",
  },
  "auth/id-token-revoked": {
    errorClass: UnauthorizedError,
    message: "Your session has been revoked",
  },
  "auth/user-disabled": {
    errorClass: ForbiddenError,
    message: "This account has been disabled",
  },
  "auth/invalid-email": {
    errorClass: ValidationError,
    message: "Please provide a valid email address",
  },
  "auth/weak-password": {
    errorClass: ValidationError,
    message: "Password is too weak",
  },
  "auth/too-many-requests": {
    errorClass: ForbiddenError,
    message: "Too many requests. Please try again later",
  },
};

export function isFirebaseError(error: unknown): error is FirebaseError {
  return (
    error instanceof Error &&
    "code" in error &&
    typeof (error as FirebaseError).code === "string"
  );
}

export function convertFirebaseError(error: FirebaseError): AppError | undefined {
  const mapping = firebaseErrorMappings[error.code];

  if (mapping) {
    return new mapping.errorClass(mapping.message);
  }

  return undefined;
}
