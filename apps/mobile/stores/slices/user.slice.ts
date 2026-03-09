import type { DocumentModel } from "@garagely/shared/models/document";
import type { SdkError, CancelableRequest } from "@garagely/api-sdk";
import { sdk } from "../sdk";

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

// React Native file format for FormData uploads
function createReactNativeFile(uri: string) {
  const uriParts = uri.split(".");
  const extension = uriParts[uriParts.length - 1]?.toLowerCase() || "jpg";
  const mimeType = extension === "png" ? "image/png" : "image/jpeg";

  return {
    uri,
    type: mimeType,
    name: `avatar.${extension}`,
  } as unknown as Blob; // Cast for React Native FormData compatibility
}

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

    const file = createReactNativeFile(uri);

    const { request, cancel } = sdk.user.uploadAvatar(file, {
      onSuccess: (data) => {
        set({
          avatar: data,
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
      onSuccess: (data) => {
        set({ avatar: data });
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
