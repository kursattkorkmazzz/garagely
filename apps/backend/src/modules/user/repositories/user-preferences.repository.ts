import {
  userPreferencesModelValidator,
  type UserPreferencesModel,
} from "@garagely/shared/models/user-preferences";
import type { UpdateUserPreferencesPayload } from "@garagely/shared/payloads/user";
import type { IUserPreferencesRepository } from "./user.repository.interface";
import { db } from "../../../providers/firebase/firebase.provider";

const USER_PREFERENCES_COLLECTION = "user_preferences";

export class UserPreferencesRepository implements IUserPreferencesRepository {
  async findByUserId(userId: string): Promise<UserPreferencesModel | null> {
    const snapshot = await db
      .collection(USER_PREFERENCES_COLLECTION)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return userPreferencesModelValidator.cast({ id: doc.id, ...doc.data() });
  }

  async create(userId: string): Promise<UserPreferencesModel> {
    const now = new Date();
    const data = {
      userId,
      locale: "en",
      preferredDistanceUnit: "km",
      preferredVolumeUnit: "l",
      preferredCurrency: "usd",
      theme: "system",
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection(USER_PREFERENCES_COLLECTION).add(data);

    return userPreferencesModelValidator.cast({ id: docRef.id, ...data });
  }

  async update(
    userId: string,
    data: UpdateUserPreferencesPayload,
  ): Promise<UserPreferencesModel> {
    const snapshot = await db
      .collection(USER_PREFERENCES_COLLECTION)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return this.create(userId);
    }

    const docId = snapshot.docs[0].id;
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.locale !== undefined) {
      updateData.locale = data.locale;
    }
    if (data.preferredDistanceUnit !== undefined) {
      updateData.preferredDistanceUnit = data.preferredDistanceUnit;
    }
    if (data.preferredVolumeUnit !== undefined) {
      updateData.preferredVolumeUnit = data.preferredVolumeUnit;
    }
    if (data.preferredCurrency !== undefined) {
      updateData.preferredCurrency = data.preferredCurrency;
    }
    if (data.theme !== undefined) {
      updateData.theme = data.theme;
    }

    await db
      .collection(USER_PREFERENCES_COLLECTION)
      .doc(docId)
      .update(updateData);

    const updated = await this.findByUserId(userId);
    return updated!;
  }
}
