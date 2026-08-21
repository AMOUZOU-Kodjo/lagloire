import { http, unwrap } from "./http";

export const liveStreamApi = {
  list: (params) => unwrap(http.get("/live", { params })),
  current: () => unwrap(http.get("/live/current")),
  getById: (id) => unwrap(http.get(`/live/${id}`)),
  create: (payload) => unwrap(http.post("/live", payload)),
  update: (id, payload) => unwrap(http.put(`/live/${id}`, payload)),
  remove: (id) => unwrap(http.delete(`/live/${id}`)),
  syncYoutube: () => unwrap(http.get("/live/sync/youtube")),
  checkYoutubeVideo: (videoId) => unwrap(http.get(`/live/youtube/${videoId}`)),
};
