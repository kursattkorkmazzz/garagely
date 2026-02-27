import type {
  UserModel,
  UserWithPreferences,
} from "@garagely/shared/models/user";
import type {
  CreateUserPayload,
  UpdateUserPayload,
} from "@garagely/shared/payloads/user";
import type { IUserRepository } from "./user.repository.interface";
import { db } from "../../../providers/firebase/firebase.provider";
import { UserMapper } from "../mappers/user.mapper";
import { UserPreferencesMapper } from "../mappers/user-preferences.mapper";

const USERS_COLLECTION = "users";
const USER_PREFERENCES_COLLECTION = "user_preferences";

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<UserModel | null> {
    const doc = await db.collection(USERS_COLLECTION).doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return UserMapper.toDomain(doc.id, doc.data()!);
  }

  async findByIdWithPreferences(id: string): Promise<UserWithPreferences | null> {
    const user = await this.findById(id);

    if (!user) {
      return null;
    }

    const preferencesSnapshot = await db
      .collection(USER_PREFERENCES_COLLECTION)
      .where("userId", "==", id)
      .limit(1)
      .get();

    const preferences = preferencesSnapshot.empty
      ? null
      : UserPreferencesMapper.toDomain(
          preferencesSnapshot.docs[0].id,
          preferencesSnapshot.docs[0].data(),
        );

    return { ...user, preferences };
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    const snapshot = await db
      .collection(USERS_COLLECTION)
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return UserMapper.toDomain(doc.id, doc.data());
  }

  async create(id: string, data: CreateUserPayload): Promise<UserModel> {
    const now = new Date();
    const userData = {
      fullName: data.fullName,
      email: data.email,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection(USERS_COLLECTION).doc(id).set(userData);

    return UserMapper.toDomain(id, userData);
  }

  async update(id: string, data: UpdateUserPayload): Promise<UserModel> {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.fullName !== undefined) {
      updateData.fullName = data.fullName;
    }

    await db.collection(USERS_COLLECTION).doc(id).update(updateData);

    const updated = await this.findById(id);
    return updated!;
  }

  async delete(id: string): Promise<void> {
    await db.collection(USERS_COLLECTION).doc(id).delete();
  }
}
