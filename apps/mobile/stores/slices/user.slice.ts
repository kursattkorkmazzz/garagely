import type { DocumentModel } from "@garagely/shared/models/document";
import type { SdkError, CancelableRequest } from "@garagely/api-sdk";
import { EntityType } from "@garagely/shared/models/entity-type";
import { sdk } from "../sdk";
import { createReactNativeFile } from "@/utils/file.utils";

export interface UserCallbacks {
  onSuccess?: () => void;
  onError?: (error: SdkError) => void;
}

export interface UserSlice {
  // State
  avatar: DocumentModel | null;
  isUploadingAvatar: boolean;
  avatarError: string | null;

  // Actions
  uploadAvatar: (
    uri: string,
    callbacks?: UserCallbacks,
  ) => CancelableRequest<void>;
  getAvatar: (callbacks?: UserCallbacks) => CancelableRequest<void>;
  removeAvatar: (callbacks?: UserCallbacks) => CancelableRequest<void>;
  clearAvatarError: () => void;
}

type SetUserState = (partial: Partial<UserSlice>) => void;

export const createUserSlice = (set: SetUserState): UserSlice => ({
  // Initial state
  avatar: null,
  isUploadingAvatar: false,
  avatarError: null,

  // Actions
  uploadAvatar: (
    uri: string,
    callbacks?: UserCallbacks,
  ): CancelableRequest<void> => {
    set({ isUploadingAvatar: true, avatarError: null });

    const file = createReactNativeFile(uri, EntityType.USER_PROFILE);

    const { request, cancel } = sdk.user.uploadAvatar(file, {
      onSuccess: (response) => {
        set({
          avatar: response.data,
          isUploadingAvatar: false,
          avatarError: null,
        });
        callbacks?.onSuccess?.();
      },
      onError: (err: SdkError) => {
        set({
          isUploadingAvatar: false,
          avatarError: err.message,
        });
        callbacks?.onError?.(err);
      },
    });

    return { request, cancel };
  },

  getAvatar: (callbacks?: UserCallbacks): CancelableRequest<void> => {
    const { request, cancel } = sdk.user.getAvatar({
      onSuccess: (response) => {
        set({ avatar: response.data });
        callbacks?.onSuccess?.();
      },
      onError: (err: SdkError) => {
        // If no avatar found, it's not an error - just no avatar
        set({ avatar: null });
        callbacks?.onError?.(err);
      },
    });

    return { request, cancel };
  },

  removeAvatar: (callbacks?: UserCallbacks): CancelableRequest<void> => {
    set({ isUploadingAvatar: true, avatarError: null });

    const { request, cancel } = sdk.user.removeAvatar({
      onSuccess: () => {
        set({
          avatar: null,
          isUploadingAvatar: false,
          avatarError: null,
        });
        callbacks?.onSuccess?.();
      },
      onError: (err: SdkError) => {
        set({
          isUploadingAvatar: false,
          avatarError: err.message,
        });
        callbacks?.onError?.(err);
      },
    });

    return { request, cancel };
  },

  clearAvatarError: () => {
    set({ avatarError: null });
  },
});
