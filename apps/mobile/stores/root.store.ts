import { create } from "zustand";
import { createAuthSlice, type AuthSlice } from "./slices/auth.slice";
import { createUserSlice, type UserSlice } from "./slices/user.slice";
import { createPreferencesSlice, type PreferencesSlice } from "./slices/preferences.slice";

export interface RootState {
  auth: AuthSlice;
  user: UserSlice;
  preferences: PreferencesSlice;
}

export const useStore = create<RootState>()((set, get) => ({
  auth: createAuthSlice(
    (partial) => set((state) => ({ auth: { ...state.auth, ...partial } })),
    () => get().auth,
  ),
  user: createUserSlice((partial) =>
    set((state) => ({ user: { ...state.user, ...partial } })),
  ),
  preferences: createPreferencesSlice(
    (partial) =>
      set((state) => ({ preferences: { ...state.preferences, ...partial } })),
    // Pass setter for auth.user to preferences slice
    (user) => set((state) => ({ auth: { ...state.auth, user } })),
  ),
}));
