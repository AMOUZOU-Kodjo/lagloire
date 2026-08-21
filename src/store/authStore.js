import { create } from "zustand";

export const useAuthStore = create((set, get) => ({
  user: null, // { id, email, firstName, lastName, phone, role, churchId }
  accessToken: null,
  isHydrating: true,

  setAccessToken: (token) => set({ accessToken: token }),
  setUser: (user) => set({ user }),

  loginSuccess: ({ user, accessToken }) => set({ user, accessToken, isHydrating: false }),

  logout: () => set({ user: null, accessToken: null }),

  setHydrating: (value) => set({ isHydrating: value }),

  isAuthenticated: () => !!get().user,
}));
