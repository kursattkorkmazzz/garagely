import type { UserWithPreferences } from "@garagely/shared/models/user";
import type { UpdateUserPreferencesPayload } from "@garagely/shared/payloads/user";
import type { SdkError, CancelableRequest } from "@garagely/api-sdk";
import { sdk } from "../sdk";

export interface PreferencesCallbacks {
  onSuccess?: (user: UserWithPreferences) => void;
  onError?: (error: SdkError) => void;
}

export interface PreferencesSlice {
  // State
  isUpdating: boolean;
  error: string | null;

  // Actions
  updatePreferences: (
    payload: UpdateUserPreferencesPayload,
    callbacks?: PreferencesCallbacks,
  ) => CancelableRequest<void>;
  clearError: () => void;
}

type SetPreferencesState = (partial: Partial<PreferencesSlice>) => void;
type SetAuthUser = (user: UserWithPreferences) => void;

export const createPreferencesSlice = (
  set: SetPreferencesState,
  setAuthUser: SetAuthUser,
): PreferencesSlice => ({
  // Initial state
  isUpdating: false,
  error: null,

  // Actions
  updatePreferences: (
    payload: UpdateUserPreferencesPayload,
    callbacks?: PreferencesCallbacks,
  ): CancelableRequest<void> => {
    set({ isUpdating: true, error: null });

    const { request, cancel } = sdk.user.updatePreferences(payload, {
      onSuccess: (data) => {
        set({
          isUpdating: false,
          error: null,
        });
        // Directly update auth user for immediate UI update
        setAuthUser(data);
        callbacks?.onSuccess?.(data);
      },
      onError: (err: SdkError) => {
        set({
          isUpdating: false,
          error: err.message,
        });
        callbacks?.onError?.(err);
      },
    });

    return { request, cancel };
  },

  clearError: () => {
    set({ error: null });
  },
});
