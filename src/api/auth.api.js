import { http, unwrap } from "./http";

export const authApi = {
  sendOtp: (email) => unwrap(http.post("/auth/otp/send", { email })),
  verifyOtp: (payload) => unwrap(http.post("/auth/otp/verify", payload)),
  register: (payload) => unwrap(http.post("/auth/register", payload)),
  login: (payload) => unwrap(http.post("/auth/login", payload)),
  refresh: (refreshToken) => unwrap(http.post("/auth/refresh", refreshToken ? { refreshToken } : {})),
  logout: () => unwrap(http.post("/auth/logout")),
  me: () => unwrap(http.get("/auth/me")),
};
