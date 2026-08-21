import axios from "axios";
import { useAuthStore } from "../store/authStore";

// En production : API Render par défaut ; en dev : serveur local.
const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "https://etdv-api.onrender.com/api" : "http://localhost:4000/api");

/** Origine du backend (sans /api) — pour résoudre les fichiers servis par l'API (/uploads/…). */
export function apiOrigin() {
  return baseURL.replace(/\/api\/?$/, "");
}

/** URL complète d'un média : absolue (Cloudinary) telle quelle, relative préfixée par l'API. */
export function mediaFullUrl(mediaUrl) {
  if (!mediaUrl) return "";
  return /^https?:\/\//.test(mediaUrl) ? mediaUrl : `${apiOrigin()}${mediaUrl}`;
}

export const http = axios.create({
  baseURL,
  withCredentials: true, // nécessaire pour envoyer le cookie httpOnly refreshToken
});

// Injecte l'accessToken (mémoire, jamais localStorage) sur chaque requête
http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Rejoue automatiquement la requête après un refresh silencieux sur 401
let refreshPromise = null;

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && !original._retry && !original.url?.includes("/auth/refresh")) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          const stored = useAuthStore.getState().refreshToken;
          refreshPromise = http
            .post("/auth/refresh", stored ? { refreshToken: stored } : {})
            .finally(() => {
              refreshPromise = null;
            });
        }
        const { data } = await refreshPromise;
        // Rotation des jetons + persistance de la session renouvelée
        useAuthStore.getState().updateTokens(data.data);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return http(original);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/** Déballe le format standard { success, data, pagination } renvoyé par le backend */
export function unwrap(promise) {
  return promise.then((res) => res.data);
}
