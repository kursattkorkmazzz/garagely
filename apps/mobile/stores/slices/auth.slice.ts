import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  LoginPayload,
  RegisterPayload,
  ChangePasswordPayload,
} from "@garagely/shared/payloads/auth";
import type { UserWithPreferences } from "@garagely/shared/models/user";
import type { SdkError, CancelableRequest, SdkCallbacks } from "@garagely/api-sdk";
import type { ApiResponse } from "@garagely/shared/response.types";
import type { AuthResponse } from "@garagely/shared/payloads/auth";
import { sdk } from "../sdk";

const AUTH_TOKEN_KEY = "@garagely/auth_token";

export interface AuthSlice {
  // State
  customToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  // Actions
  login: (
    payload: LoginPayload,
    callbacks?: SdkCallbacks<ApiResponse<AuthResponse>>,
  ) => CancelableRequest<void>;
  register: (
    payload: RegisterPayload,
    callbacks?: SdkCallbacks<ApiResponse<AuthResponse>>,
  ) => CancelableRequest<void>;
  logout: () => Promise<void>;
  restoreSession: () => CancelableRequest<void>;
  changePassword: (
    payload: ChangePasswordPayload,
    callbacks?: SdkCallbacks<ApiResponse<void>>,
  ) => CancelableRequest<void>;
  clearError: () => void;
  setAuthToken: (token: string | null) => void;
}

type SetAuthState = (partial: Partial<AuthSlice>) => void;
type SetUser = (user: UserWithPreferences) => void;
type ClearUser = () => void;
type GetAvatar = () => void;

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
  setUser: SetUser,
  clearUser: ClearUser,
  getAvatar: GetAvatar,
): AuthSlice => ({
  // Initial state
  customToken: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isInitialized: false,

  // Actions
  login: (
    payload: LoginPayload,
    callbacks?: SdkCallbacks<ApiResponse<AuthResponse>>,
  ): CancelableRequest<void> => {
    set({ isLoading: true, error: null });

    const { request, cancel } = sdk.auth.login(payload, {
      onSuccess: async (response) => {
        await saveToken(response.data.customToken);
        setUser(response.data.user);
        set({
          customToken: response.data.customToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        sdk.setAuthToken(response.data.customToken);
        getAvatar();
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

  register: (
    payload: RegisterPayload,
    callbacks?: SdkCallbacks<ApiResponse<AuthResponse>>,
  ): CancelableRequest<void> => {
    set({ isLoading: true, error: null });

    const { request, cancel } = sdk.auth.register(payload, {
      onSuccess: async (response) => {
        await saveToken(response.data.customToken);
        setUser(response.data.user);
        set({
          customToken: response.data.customToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        sdk.setAuthToken(response.data.customToken);
        getAvatar();
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

  logout: async () => {
    await clearToken();
    clearUser();
    set({
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
          setUser(response.data);
          set({
            customToken: token,
            isAuthenticated: true,
            isInitialized: true,
          });
          getAvatar();
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
    callbacks?: SdkCallbacks<ApiResponse<void>>,
  ): CancelableRequest<void> => {
    set({ isLoading: true, error: null });

    const { request, cancel } = sdk.auth.changePassword(payload, {
      onSuccess: (response) => {
        set({
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

  clearError: () => {
    set({ error: null });
  },

  setAuthToken: (token: string | null) => {
    set({ customToken: token });
    sdk.setAuthToken(token);
  },
});
