import type {
  UserModel,
  UserPreferencesModel,
  UserWithPreferences,
} from '@garagely/shared/models/user';
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UpdateUserPreferencesPayload,
} from '@garagely/shared/payloads/user';

export interface IUserRepository {
  findById(id: string): Promise<UserModel | null>;
  findByIdWithPreferences(id: string): Promise<UserWithPreferences | null>;
  findByEmail(email: string): Promise<UserModel | null>;
  create(id: string, data: CreateUserPayload): Promise<UserModel>;
  update(id: string, data: UpdateUserPayload): Promise<UserModel>;
  delete(id: string): Promise<void>;
}

export interface IUserPreferencesRepository {
  findByUserId(userId: string): Promise<UserPreferencesModel | null>;
  create(userId: string): Promise<UserPreferencesModel>;
  update(
    userId: string,
    data: UpdateUserPreferencesPayload
  ): Promise<UserPreferencesModel>;
}
