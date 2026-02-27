import * as yup from "yup";

interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds: number;
  toDate?: () => Date;
}

function isFirestoreTimestamp(value: unknown): value is FirestoreTimestamp {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    typeof obj._seconds === "number" && typeof obj._nanoseconds === "number"
  );
}

/**
 * Custom Yup date schema that handles Firestore Timestamp objects.
 * Works with:
 * - JavaScript Date objects
 * - Date strings
 * - Numbers (timestamps)
 * - Firestore Timestamp objects (with _seconds/_nanoseconds)
 */
export const firestoreDate = () =>
  yup.date().transform((value, originalValue) => {
    if (isFirestoreTimestamp(originalValue)) {
      return typeof originalValue.toDate === "function"
        ? originalValue.toDate()
        : new Date(originalValue._seconds * 1000);
    }
    return value;
  });
