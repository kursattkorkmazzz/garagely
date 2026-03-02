import type { UserWithPreferences } from "@garagely/shared/models/user";
import type { UpdateUserPreferencesPayload } from "@garagely/shared/payloads/user";
import type { SdkError } from "@garagely/api-sdk";
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
  ) => Promise<void>;
  clearError: () => void;
}

type SetPreferencesState = (partial: Partial<PreferencesSlice>) => void;

export const createPreferencesSlice = (
  set: SetPreferencesState,
): PreferencesSlice => ({
  // Initial state
  isUpdating: false,
  error: null,

  // Actions
  updatePreferences: async (
    payload: UpdateUserPreferencesPayload,
    callbacks?: PreferencesCallbacks,
  ) => {
    set({ isUpdating: true, error: null });

    await sdk.user.updatePreferences(payload, {
      onSuccess: (data) => {
        set({
          isUpdating: false,
          error: null,
        });
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
  },

  clearError: () => {
    set({ error: null });
  },
});
