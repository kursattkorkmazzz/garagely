import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  LoginPayload,
  RegisterPayload,
  ChangePasswordPayload,
} from "@garagely/shared/payloads/auth";
import type { UserWithPreferences } from "@garagely/shared/models/user";
import type { SdkError, CancelableRequest } from "@garagely/api-sdk";
import { sdk } from "../sdk";

const AUTH_TOKEN_KEY = "@garagely/auth_token";

export interface AuthCallbacks {
  onSuccess?: () => void;
  onError?: (error: SdkError) => void;
}

export interface AuthSlice {
  // State
  user: UserWithPreferences | null;
  customToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  // Actions
  login: (
    payload: LoginPayload,
    callbacks?: AuthCallbacks,
  ) => CancelableRequest<void>;
  register: (
    payload: RegisterPayload,
    callbacks?: AuthCallbacks,
  ) => CancelableRequest<void>;
  logout: () => Promise<void>;
  restoreSession: () => CancelableRequest<void>;
  changePassword: (
    payload: ChangePasswordPayload,
    callbacks?: AuthCallbacks,
  ) => CancelableRequest<void>;
  clearError: () => void;
  setAuthToken: (token: string | null) => void;
  setUser: (user: UserWithPreferences) => void;
}

type SetAuthState = (partial: Partial<AuthSlice>) => void;
type GetAuthState = () => AuthSlice;

async function saveToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    // Ignore storage errors
  }
}

async function clearToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // Ignore storage errors
  }
}

async function getStoredToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export const createAuthSlice = (
  set: SetAuthState,
  get: GetAuthState,
): AuthSlice => ({
  // Initial state
  user: null,
  customToken: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isInitialized: false,

  // Actions
  login: (
    payload: LoginPayload,
    callbacks?: AuthCallbacks,
  ): CancelableRequest<void> => {
    set({ isLoading: true, error: null });

    const { request, cancel } = sdk.auth.login(payload, {
      onSuccess: async (response) => {
        await saveToken(response.data.customToken);
        set({
          user: response.data.user,
          customToken: response.data.customToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        sdk.setAuthToken(response.data.customToken);
        callbacks?.onSuccess?.();
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

  register: (
    payload: RegisterPayload,
    callbacks?: AuthCallbacks,
  ): CancelableRequest<void> => {
    set({ isLoading: true, error: null });

    const { request, cancel } = sdk.auth.register(payload, {
      onSuccess: async (response) => {
        await saveToken(response.data.customToken);
        set({
          user: response.data.user,
          customToken: response.data.customToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        sdk.setAuthToken(response.data.customToken);
        callbacks?.onSuccess?.();
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

  logout: async () => {
    await clearToken();
    set({
      user: null,
      customToken: null,
      isAuthenticated: false,
      error: null,
    });
    sdk.setAuthToken(null);
  },

  restoreSession: (): CancelableRequest<void> => {
    let cancelGetMe: (() => void) | undefined;

    const request = (async () => {
      const token = await getStoredToken();

      if (!token) {
        set({ isInitialized: true });
        return;
      }

      sdk.setAuthToken(token);

      const { request: getMeRequest, cancel } = sdk.user.getMe({
        onSuccess: (response) => {
          set({
            user: response.data,
            customToken: token,
            isAuthenticated: true,
            isInitialized: true,
          });
        },
        onError: async () => {
          // Token is invalid or expired, clear it
          await clearToken();
          sdk.setAuthToken(null);
          set({ isInitialized: true });
        },
      });

      cancelGetMe = cancel;
      await getMeRequest;
    })();

    return {
      request,
      cancel: () => cancelGetMe?.(),
    };
  },

  changePassword: (
    payload: ChangePasswordPayload,
    callbacks?: AuthCallbacks,
  ): CancelableRequest<void> => {
    set({ isLoading: true, error: null });

    const { request, cancel } = sdk.auth.changePassword(payload, {
      onSuccess: () => {
        set({
          isLoading: false,
          error: null,
        });
        callbacks?.onSuccess?.();
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

  clearError: () => {
    set({ error: null });
  },

  setAuthToken: (token: string | null) => {
    set({ customToken: token });
    sdk.setAuthToken(token);
  },

  setUser: (user: UserWithPreferences) => {
    set({ user });
  },
});
