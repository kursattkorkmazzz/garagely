import type { UserWithPreferences } from "@garagely/shared/models/user";
import type { DocumentModel } from "@garagely/shared/models/document";
import type {
  UpdateUserPayload,
  UpdateUserPreferencesPayload,
} from "@garagely/shared/payloads/user";
import type {
  SdkError,
  CancelableRequest,
  SdkCallbacks,
} from "@garagely/api-sdk";
import type { ApiResponse } from "@garagely/shared/response.types";
import { EntityType } from "@garagely/shared/models/entity-type";
import { sdk } from "../sdk";
import { createReactNativeFile } from "@/utils/file.utils";
import { setCachedPreferences } from "@/utils/preferences-cache";

// Helper to cache preferences from user data
function cacheUserPreferences(user: UserWithPreferences): void {
  if (user.preferences) {
    setCachedPreferences({
      theme: user.preferences.theme,
      locale: user.preferences.locale,
      preferredDistanceUnit: user.preferences.preferredDistanceUnit,
      preferredVolumeUnit: user.preferences.preferredVolumeUnit,
      preferredCurrency: user.preferences.preferredCurrency,
    });
  }
}

export interface UserSlice {
  // State
  user: UserWithPreferences | null;
  avatar: DocumentModel | null;
  isLoading: boolean;
  isUploadingAvatar: boolean;
  error: string | null;

  // Actions
  fetchUser: (
    callbacks?: SdkCallbacks<ApiResponse<UserWithPreferences>>,
  ) => CancelableRequest<void>;
  updateUser: (
    payload: UpdateUserPayload,
    callbacks?: SdkCallbacks<ApiResponse<UserWithPreferences>>,
  ) => CancelableRequest<void>;
  updatePreferences: (
    payload: UpdateUserPreferencesPayload,
    callbacks?: SdkCallbacks<ApiResponse<UserWithPreferences>>,
  ) => CancelableRequest<void>;
  uploadAvatar: (
    uri: string,
    callbacks?: SdkCallbacks<ApiResponse<DocumentModel>>,
  ) => CancelableRequest<void>;
  getAvatar: (
    callbacks?: SdkCallbacks<ApiResponse<DocumentModel>>,
  ) => CancelableRequest<void>;
  removeAvatar: (
    callbacks?: SdkCallbacks<ApiResponse<void>>,
  ) => CancelableRequest<void>;
  setUser: (user: UserWithPreferences) => void;
  clearUser: () => void;
  clearError: () => void;
}

type SetUserState = (partial: Partial<UserSlice>) => void;

export const createUserSlice = (set: SetUserState): UserSlice => ({
  // Initial state
  user: null,
  avatar: null,
  isLoading: false,
  isUploadingAvatar: false,
  error: null,

  // Actions
  fetchUser: (
    callbacks?: SdkCallbacks<ApiResponse<UserWithPreferences>>,
  ): CancelableRequest<void> => {
    set({ isLoading: true, error: null });

    const { request, cancel } = sdk.user.getMe({
      onSuccess: (response) => {
        set({
          user: response.data,
          isLoading: false,
          error: null,
        });
        cacheUserPreferences(response.data);
        callbacks?.onSuccess?.(response);
      },
      onError: (err: SdkError) => {
        set({
          isLoading: false,
          error: err.message,
        });
        callbacks?.onError?.(err);
      },
    });

    return { request, cancel };
  },

  updateUser: (
    payload: UpdateUserPayload,
    callbacks?: SdkCallbacks<ApiResponse<UserWithPreferences>>,
  ): CancelableRequest<void> => {
    set({ isLoading: true, error: null });

    const { request, cancel } = sdk.user.updateMe(payload, {
      onSuccess: (response) => {
        set({
          user: response.data,
          isLoading: false,
          error: null,
        });
        callbacks?.onSuccess?.(response);
      },
      onError: (err: SdkError) => {
        set({
          isLoading: false,
          error: err.message,
        });
        callbacks?.onError?.(err);
      },
    });

    return { request, cancel };
  },

  updatePreferences: (
    payload: UpdateUserPreferencesPayload,
    callbacks?: SdkCallbacks<ApiResponse<UserWithPreferences>>,
  ): CancelableRequest<void> => {
    set({ isLoading: true, error: null });

    const { request, cancel } = sdk.user.updatePreferences(payload, {
      onSuccess: (response) => {
        set({
          user: response.data,
          isLoading: false,
          error: null,
        });
        cacheUserPreferences(response.data);
        callbacks?.onSuccess?.(response);
      },
      onError: (err: SdkError) => {
        set({
          isLoading: false,
          error: err.message,
        });
        callbacks?.onError?.(err);
      },
    });

    return { request, cancel };
  },

  uploadAvatar: (
    uri: string,
    callbacks?: SdkCallbacks<ApiResponse<DocumentModel>>,
  ): CancelableRequest<void> => {
    set({ isUploadingAvatar: true, error: null });

    const file = createReactNativeFile(uri, EntityType.USER_PROFILE);

    const { request, cancel } = sdk.user.uploadAvatar(file, {
      onSuccess: (response) => {
        set({
          avatar: response.data,
          isUploadingAvatar: false,
          error: null,
        });
        callbacks?.onSuccess?.(response);
      },
      onError: (err: SdkError) => {
        set({
          isUploadingAvatar: false,
          error: err.message,
        });
        callbacks?.onError?.(err);
      },
    });

    return { request, cancel };
  },

  getAvatar: (
    callbacks?: SdkCallbacks<ApiResponse<DocumentModel>>,
  ): CancelableRequest<void> => {
    const { request, cancel } = sdk.user.getAvatar({
      onSuccess: (response) => {
        set({ avatar: response.data });
        callbacks?.onSuccess?.(response);
      },
      onError: (err: SdkError) => {
        // If no avatar found, it's not an error - just no avatar
        set({ avatar: null });
        callbacks?.onError?.(err);
      },
    });

    return { request, cancel };
  },

  removeAvatar: (
    callbacks?: SdkCallbacks<ApiResponse<void>>,
  ): CancelableRequest<void> => {
    set({ isLoading: true, error: null });

    const { request, cancel } = sdk.user.removeAvatar({
      onSuccess: (response) => {
        set({
          avatar: null,
          isLoading: false,
          error: null,
        });
        callbacks?.onSuccess?.(response);
      },
      onError: (err: SdkError) => {
        set({
          isLoading: false,
          error: err.message,
        });
        callbacks?.onError?.(err);
      },
    });

    return { request, cancel };
  },

  setUser: (user: UserWithPreferences) => {
    set({ user });
    cacheUserPreferences(user);
  },

  clearUser: () => {
    set({ user: null, avatar: null, error: null });
    // Keep cached preferences so auth screens can use them
  },

  clearError: () => {
    set({ error: null });
  },
});
