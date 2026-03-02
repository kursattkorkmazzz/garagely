import { create } from "zustand";
import { createAuthSlice, type AuthSlice } from "./slices/auth.slice";
import { createUserSlice, type UserSlice } from "./slices/user.slice";

export interface RootState {
  auth: AuthSlice;
  user: UserSlice;
}

export const useStore = create<RootState>()((set) => ({
  auth: createAuthSlice((partial) =>
    set((state) => ({ auth: { ...state.auth, ...partial } })),
  ),
  user: createUserSlice((partial) =>
    set((state) => ({ user: { ...state.user, ...partial } })),
  ),
}));
