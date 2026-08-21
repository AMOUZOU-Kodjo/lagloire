import { http, unwrap } from "./http";

export const statsApi = {
  dashboard: () => unwrap(http.get("/stats/dashboard")),
  general: () => unwrap(http.get("/stats")),
  church: (churchId) => unwrap(http.get(`/stats/churches/${churchId}`)),
  track: (payload) => unwrap(http.post("/stats/track", payload)),
};
