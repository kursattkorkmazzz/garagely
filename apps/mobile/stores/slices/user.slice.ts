import type { DocumentModel } from "@garagely/shared/models/document";
import type { SdkError } from "@garagely/api-sdk";
import { sdk } from "../sdk";

export interface UserCallbacks {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export interface UserSlice {
  // State
  avatar: DocumentModel | null;
  isUploadingAvatar: boolean;
  avatarError: string | null;

  // Actions
  uploadAvatar: (uri: string, callbacks?: UserCallbacks) => Promise<void>;
  getAvatar: (callbacks?: UserCallbacks) => Promise<void>;
  removeAvatar: (callbacks?: UserCallbacks) => Promise<void>;
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
  uploadAvatar: async (uri: string, callbacks?: UserCallbacks) => {
    set({ isUploadingAvatar: true, avatarError: null });

    const file = createReactNativeFile(uri);

    await sdk.user.uploadAvatar(file, {
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
        callbacks?.onError?.(err.message);
      },
    });
  },

  getAvatar: async (callbacks?: UserCallbacks) => {
    await sdk.user.getAvatar({
      onSuccess: (data) => {
        set({ avatar: data });
        callbacks?.onSuccess?.();
      },
      onError: (err: SdkError) => {
        // If no avatar found, it's not an error - just no avatar
        set({ avatar: null });
        callbacks?.onError?.(err.message);
      },
    });
  },

  removeAvatar: async (callbacks?: UserCallbacks) => {
    set({ isUploadingAvatar: true, avatarError: null });

    await sdk.user.removeAvatar({
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
        callbacks?.onError?.(err.message);
      },
    });
  },

  clearAvatarError: () => {
    set({ avatarError: null });
  },
});
