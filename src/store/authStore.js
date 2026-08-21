import { create } from "zustand";

// La session est conservée localement pour survivre au rechargement :
// les cookies tiers (frontend ≠ domaine API) étant de plus en plus bloqués,
// le refresh token sert de secours et repart dans le corps des requêtes.
const STORAGE_KEY = "etdv.session";

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") ?? {};
  } catch {
    return {};
  }
}

export const useAuthStore = create((set, get) => ({
  user: loadSession().user ?? null, // { id, email, firstName, lastName, phone, role, churchId }
  accessToken: loadSession().accessToken ?? null,
  refreshToken: loadSession().refreshToken ?? null,
  isHydrating: true,

  setAccessToken: (token) => set({ accessToken: token }),

  /** Met à jour les jetons (rotation) en réécrivant la session locale. */
  updateTokens: ({ accessToken, refreshToken }) => {
    const user = get().user;
    const nextRefresh = refreshToken ?? get().refreshToken ?? null;
    set({ accessToken, refreshToken: nextRefresh });
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, accessToken, refreshToken: nextRefresh }));
    }
  },
  setUser: (user) => {
    set({ user });
    const { accessToken, refreshToken } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, accessToken, refreshToken }));
  },

  loginSuccess: ({ user, accessToken, refreshToken }) => {
    set({ user, accessToken, refreshToken: refreshToken ?? get().refreshToken ?? null, isHydrating: false });
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user, accessToken, refreshToken: refreshToken ?? get().refreshToken ?? null })
    );
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null, accessToken: null, refreshToken: null });
  },

  setHydrating: (value) => set({ isHydrating: value }),

  isAuthenticated: () => !!get().user,
}));
