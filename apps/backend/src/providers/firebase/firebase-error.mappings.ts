import {
  ConflictError,
  ForbiddenError,
  InvalidCredentialsError,
  UnauthorizedError,
  ValidationError,
} from "@garagely/shared/error.types";
import type {
  FirebaseAuthErrorCode,
  FirebaseErrorMapping,
} from "./firebase-error.types";

/**
 * Maps Firebase Auth error codes to AppError subclasses with user-friendly messages
 */
export const firebaseAuthErrorMappings: Record<
  FirebaseAuthErrorCode,
  FirebaseErrorMapping
> = {
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
