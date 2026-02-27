import * as admin from "firebase-admin";
import { logger } from "../../common/logger/logger";

const useEmulator = process.env.FIREBASE_USE_EMULATOR === "true";

function initializeFirebase(): admin.app.App {
  if (admin.apps.length) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (useEmulator) {
    logger.info({ projectId }, "Initializing Firebase with emulator");

    process.env.FIRESTORE_EMULATOR_HOST =
      process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080";
    process.env.FIREBASE_AUTH_EMULATOR_HOST =
      process.env.FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1:9099";
    process.env.FIREBASE_STORAGE_EMULATOR_HOST =
      process.env.FIREBASE_STORAGE_EMULATOR_HOST ?? "127.0.0.1:9199";

    return admin.initializeApp({
      projectId,
      storageBucket: `${projectId}.appspot.com`,
    });
  }

  logger.info({ projectId }, "Initializing Firebase with cloud credentials");

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY",
    );
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? `${projectId}.appspot.com`,
  });
}

const app = initializeFirebase();

export { app };
export const auth = admin.auth();
export const db = admin.firestore();
export const storage = admin.storage();
