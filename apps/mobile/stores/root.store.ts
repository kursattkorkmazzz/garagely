import { create } from "zustand";
import { createAuthSlice, type AuthSlice } from "./slices/auth.slice";

export interface RootState {
  auth: AuthSlice;
}

export const useStore = create<RootState>()((set) => ({
  auth: createAuthSlice((partial) =>
    set((state) => ({ auth: { ...state.auth, ...partial } })),
  ),
}));
