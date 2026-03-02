import type {
  UpdateUserPayload,
  UpdateUserPreferencesPayload,
} from "@garagely/shared/payloads/user";
import type {
  UserWithPreferences,
  UserPreferencesModel,
} from "@garagely/shared/models/user";
import type { DocumentModel } from "@garagely/shared/models/document";
import type { HttpClient, SdkCallbacks, SdkError } from "../../types";

export interface UserApi {
  getMe(callbacks?: SdkCallbacks<UserWithPreferences>): Promise<void>;
  updateMe(
    payload: UpdateUserPayload,
    callbacks?: SdkCallbacks<UserWithPreferences>,
  ): Promise<void>;
  deleteMe(callbacks?: SdkCallbacks<void>): Promise<void>;
  updatePreferences(
    payload: UpdateUserPreferencesPayload,
    callbacks?: SdkCallbacks<UserWithPreferences>,
  ): Promise<void>;
  uploadAvatar(
    file: File | Blob,
    callbacks?: SdkCallbacks<DocumentModel>,
  ): Promise<void>;
  getAvatar(callbacks?: SdkCallbacks<DocumentModel>): Promise<void>;
  removeAvatar(callbacks?: SdkCallbacks<void>): Promise<void>;
}

export function createUserApi(client: HttpClient): UserApi {
  return {
    async getMe(callbacks?: SdkCallbacks<UserWithPreferences>): Promise<void> {
      try {
        const data = await client.get<UserWithPreferences>("/users/me");
        callbacks?.onSuccess?.(data);
      } catch (error) {
        callbacks?.onError?.(error as SdkError);
      }
    },

    async updateMe(
      payload: UpdateUserPayload,
      callbacks?: SdkCallbacks<UserWithPreferences>,
    ): Promise<void> {
      try {
        const data = await client.patch<UserWithPreferences>(
          "/users/me",
          payload,
        );
        callbacks?.onSuccess?.(data);
      } catch (error) {
        callbacks?.onError?.(error as SdkError);
      }
    },

    async deleteMe(callbacks?: SdkCallbacks<void>): Promise<void> {
      try {
        await client.delete<void>("/users/me");
        callbacks?.onSuccess?.(undefined);
      } catch (error) {
        callbacks?.onError?.(error as SdkError);
      }
    },

    async updatePreferences(
      payload: UpdateUserPreferencesPayload,
      callbacks?: SdkCallbacks<UserWithPreferences>,
    ): Promise<void> {
      try {
        const data = await client.patch<UserWithPreferences>(
          "/users/me/preferences",
          payload,
        );
        callbacks?.onSuccess?.(data);
      } catch (error) {
        callbacks?.onError?.(error as SdkError);
      }
    },

    async uploadAvatar(
      file: File | Blob,
      callbacks?: SdkCallbacks<DocumentModel>,
    ): Promise<void> {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const data = await client.postFormData<DocumentModel>(
          "/users/me/avatar",
          formData,
        );
        callbacks?.onSuccess?.(data);
      } catch (error) {
        callbacks?.onError?.(error as SdkError);
      }
    },

    async getAvatar(callbacks?: SdkCallbacks<DocumentModel>): Promise<void> {
      try {
        const data = await client.get<DocumentModel>("/users/me/avatar");
        callbacks?.onSuccess?.(data);
      } catch (error) {
        callbacks?.onError?.(error as SdkError);
      }
    },

    async removeAvatar(callbacks?: SdkCallbacks<void>): Promise<void> {
      try {
        await client.delete<void>("/users/me/avatar");
        callbacks?.onSuccess?.(undefined);
      } catch (error) {
        callbacks?.onError?.(error as SdkError);
      }
    },
  };
}
