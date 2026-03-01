import type { LoginPayload, RegisterPayload } from "@garagely/shared/payloads/auth";
import type { UserWithPreferences } from "@garagely/shared/models/user";
import type { SdkError } from "@garagely/api-sdk";
import { sdk } from "../sdk";

export interface AuthCallbacks {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export interface AuthSlice {
  // State
  user: UserWithPreferences | null;
  customToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (payload: LoginPayload, callbacks?: AuthCallbacks) => Promise<void>;
  register: (payload: RegisterPayload, callbacks?: AuthCallbacks) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setAuthToken: (token: string | null) => void;
}

type SetAuthState = (partial: Partial<AuthSlice>) => void;

export const createAuthSlice = (set: SetAuthState): AuthSlice => ({
  // Initial state
  user: null,
  customToken: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  // Actions
  login: async (payload: LoginPayload, callbacks?: AuthCallbacks) => {
    set({ isLoading: true, error: null });

    await sdk.auth.login(payload, {
      onSuccess: (data) => {
        set({
          user: data.user,
          customToken: data.customToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        sdk.setAuthToken(data.customToken);
        callbacks?.onSuccess?.();
      },
      onError: (err: SdkError) => {
        set({
          isLoading: false,
          error: err.message,
        });
        callbacks?.onError?.(err.message);
      },
    });
  },

  register: async (payload: RegisterPayload, callbacks?: AuthCallbacks) => {
    set({ isLoading: true, error: null });

    await sdk.auth.register(payload, {
      onSuccess: (data) => {
        set({
          user: data.user,
          customToken: data.customToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        sdk.setAuthToken(data.customToken);
        callbacks?.onSuccess?.();
      },
      onError: (err: SdkError) => {
        set({
          isLoading: false,
          error: err.message,
        });
        callbacks?.onError?.(err.message);
      },
    });
  },

  logout: () => {
    set({
      user: null,
      customToken: null,
      isAuthenticated: false,
      error: null,
    });
    sdk.setAuthToken(null);
  },

  clearError: () => {
    set({ error: null });
  },

  setAuthToken: (token: string | null) => {
    set({ customToken: token });
    sdk.setAuthToken(token);
  },
});
