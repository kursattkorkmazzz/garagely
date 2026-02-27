export { app, auth, db } from "./firebase.provider";
export { isFirebaseError, convertFirebaseError } from "./firebase-error.handler";
export type {
  FirebaseAuthErrorCode,
  FirebaseError,
  FirebaseErrorMapping,
} from "./firebase-error.types";
