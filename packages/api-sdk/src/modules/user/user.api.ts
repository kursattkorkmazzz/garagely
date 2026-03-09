import type {
  UpdateUserPayload,
  UpdateUserPreferencesPayload,
} from "@garagely/shared/payloads/user";
import type { UserWithPreferences } from "@garagely/shared/models/user";
import type { DocumentModel } from "@garagely/shared/models/document";
import type {
  HttpClient,
  SdkCallbacks,
  SdkError,
  CancelableRequest,
} from "../../types";

export interface UserApi {
  getMe(
    callbacks?: SdkCallbacks<UserWithPreferences>,
    key?: string,
  ): CancelableRequest<void>;
  updateMe(
    payload: UpdateUserPayload,
    callbacks?: SdkCallbacks<UserWithPreferences>,
    key?: string,
  ): CancelableRequest<void>;
  deleteMe(callbacks?: SdkCallbacks<void>, key?: string): CancelableRequest<void>;
  updatePreferences(
    payload: UpdateUserPreferencesPayload,
    callbacks?: SdkCallbacks<UserWithPreferences>,
    key?: string,
  ): CancelableRequest<void>;
  uploadAvatar(
    file: File | Blob,
    callbacks?: SdkCallbacks<DocumentModel>,
    key?: string,
  ): CancelableRequest<void>;
  getAvatar(
    callbacks?: SdkCallbacks<DocumentModel>,
    key?: string,
  ): CancelableRequest<void>;
  removeAvatar(callbacks?: SdkCallbacks<void>, key?: string): CancelableRequest<void>;
}

export function createUserApi(client: HttpClient): UserApi {
  return {
    getMe(
      callbacks?: SdkCallbacks<UserWithPreferences>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.get<UserWithPreferences>(
        "/users/me",
        key,
      );

      return {
        request: request
          .then((data) => {
            callbacks?.onSuccess?.(data);
          })
          .catch((error) => {
            callbacks?.onError?.(error as SdkError);
          }),
        cancel,
      };
    },

    updateMe(
      payload: UpdateUserPayload,
      callbacks?: SdkCallbacks<UserWithPreferences>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.patch<UserWithPreferences>(
        "/users/me",
        payload,
        key,
      );

      return {
        request: request
          .then((data) => {
            callbacks?.onSuccess?.(data);
          })
          .catch((error) => {
            callbacks?.onError?.(error as SdkError);
          }),
        cancel,
      };
    },

    deleteMe(
      callbacks?: SdkCallbacks<void>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.delete<void>("/users/me", key);

      return {
        request: request
          .then(() => {
            callbacks?.onSuccess?.(undefined);
          })
          .catch((error) => {
            callbacks?.onError?.(error as SdkError);
          }),
        cancel,
      };
    },

    updatePreferences(
      payload: UpdateUserPreferencesPayload,
      callbacks?: SdkCallbacks<UserWithPreferences>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.patch<UserWithPreferences>(
        "/users/me/preferences",
        payload,
        key,
      );

      return {
        request: request
          .then((data) => {
            callbacks?.onSuccess?.(data);
          })
          .catch((error) => {
            callbacks?.onError?.(error as SdkError);
          }),
        cancel,
      };
    },

    uploadAvatar(
      file: File | Blob,
      callbacks?: SdkCallbacks<DocumentModel>,
      key?: string,
    ): CancelableRequest<void> {
      const formData = new FormData();
      formData.append("file", file);

      const { request, cancel } = client.postFormData<DocumentModel>(
        "/users/me/avatar",
        formData,
        key,
      );

      return {
        request: request
          .then((data) => {
            callbacks?.onSuccess?.(data);
          })
          .catch((error) => {
            callbacks?.onError?.(error as SdkError);
          }),
        cancel,
      };
    },

    getAvatar(
      callbacks?: SdkCallbacks<DocumentModel>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.get<DocumentModel>(
        "/users/me/avatar",
        key,
      );

      return {
        request: request
          .then((data) => {
            callbacks?.onSuccess?.(data);
          })
          .catch((error) => {
            callbacks?.onError?.(error as SdkError);
          }),
        cancel,
      };
    },

    removeAvatar(
      callbacks?: SdkCallbacks<void>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.delete<void>("/users/me/avatar", key);

      return {
        request: request
          .then(() => {
            callbacks?.onSuccess?.(undefined);
          })
          .catch((error) => {
            callbacks?.onError?.(error as SdkError);
          }),
        cancel,
      };
    },
  };
}
