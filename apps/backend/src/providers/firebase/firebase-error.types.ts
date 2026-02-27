import type { AppError } from "@garagely/shared/error.types";

/**
 * Common Firebase Auth error codes from Firebase Admin SDK
 * @see https://firebase.google.com/docs/auth/admin/errors
 */
export type FirebaseAuthErrorCode =
  | "auth/email-already-exists"
  | "auth/user-not-found"
  | "auth/invalid-password"
  | "auth/wrong-password"
  | "auth/invalid-id-token"
  | "auth/id-token-expired"
  | "auth/id-token-revoked"
  | "auth/user-disabled"
  | "auth/invalid-email"
  | "auth/weak-password"
  | "auth/invalid-credential"
  | "auth/too-many-requests";

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
export interface FirebaseErrorMapping {
  errorClass: new (message: string) => AppError;
  message: string;
}
