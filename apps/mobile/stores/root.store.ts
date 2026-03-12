import { create } from "zustand";
import { createAuthSlice, type AuthSlice } from "./slices/auth.slice";
import { createUserSlice, type UserSlice } from "./slices/user.slice";

export interface RootState {
  auth: AuthSlice;
  user: UserSlice;
}

export const useStore = create<RootState>()((set, get) => ({
  auth: createAuthSlice(
    (partial) => set((state) => ({ auth: { ...state.auth, ...partial } })),
    // setUser - delegate to user slice
    (user) => get().user.setUser(user),
    // clearUser - delegate to user slice
    () => get().user.clearUser(),
  ),
  user: createUserSlice((partial) =>
    set((state) => ({ user: { ...state.user, ...partial } })),
  ),
}));
