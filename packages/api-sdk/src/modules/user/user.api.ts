import type {
  UpdateUserPayload,
  UpdateUserPreferencesPayload,
} from "@garagely/shared/payloads/user";
import type { UserWithPreferences } from "@garagely/shared/models/user";
import type { DocumentModel } from "@garagely/shared/models/document";
import type { ApiResponse } from "@garagely/shared/response.types";
import type {
  HttpClient,
  SdkCallbacks,
  SdkError,
  CancelableRequest,
} from "../../types";

export interface UserApi {
  getMe(
    callbacks?: SdkCallbacks<ApiResponse<UserWithPreferences>>,
    key?: string,
  ): CancelableRequest<void>;
  updateMe(
    payload: UpdateUserPayload,
    callbacks?: SdkCallbacks<ApiResponse<UserWithPreferences>>,
    key?: string,
  ): CancelableRequest<void>;
  deleteMe(
    callbacks?: SdkCallbacks<ApiResponse<void>>,
    key?: string,
  ): CancelableRequest<void>;
  updatePreferences(
    payload: UpdateUserPreferencesPayload,
    callbacks?: SdkCallbacks<ApiResponse<UserWithPreferences>>,
    key?: string,
  ): CancelableRequest<void>;
  uploadAvatar(
    file: File | Blob,
    callbacks?: SdkCallbacks<ApiResponse<DocumentModel>>,
    key?: string,
  ): CancelableRequest<void>;
  getAvatar(
    callbacks?: SdkCallbacks<ApiResponse<DocumentModel>>,
    key?: string,
  ): CancelableRequest<void>;
  removeAvatar(
    callbacks?: SdkCallbacks<ApiResponse<void>>,
    key?: string,
  ): CancelableRequest<void>;
}

export function createUserApi(client: HttpClient): UserApi {
  return {
    getMe(
      callbacks?: SdkCallbacks<ApiResponse<UserWithPreferences>>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.get<ApiResponse<UserWithPreferences>>(
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
      callbacks?: SdkCallbacks<ApiResponse<UserWithPreferences>>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.patch<ApiResponse<UserWithPreferences>>(
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
      callbacks?: SdkCallbacks<ApiResponse<void>>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.delete<ApiResponse<void>>(
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

    updatePreferences(
      payload: UpdateUserPreferencesPayload,
      callbacks?: SdkCallbacks<ApiResponse<UserWithPreferences>>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.patch<ApiResponse<UserWithPreferences>>(
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
      callbacks?: SdkCallbacks<ApiResponse<DocumentModel>>,
      key?: string,
    ): CancelableRequest<void> {
      const formData = new FormData();
      formData.append("file", file);

      const { request, cancel } = client.postFormData<ApiResponse<DocumentModel>>(
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
      callbacks?: SdkCallbacks<ApiResponse<DocumentModel>>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.get<ApiResponse<DocumentModel>>(
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
      callbacks?: SdkCallbacks<ApiResponse<void>>,
      key?: string,
    ): CancelableRequest<void> {
      const { request, cancel } = client.delete<ApiResponse<void>>(
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
  };
}
