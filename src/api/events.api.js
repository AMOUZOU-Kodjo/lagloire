import { http, unwrap } from "./http";

export const eventsApi = {
  list: (params) => unwrap(http.get("/events", { params })),
  getById: (id) => unwrap(http.get(`/events/${id}`)),
  create: (payload) => unwrap(http.post("/events", payload)),
  update: (id, payload) => unwrap(http.put(`/events/${id}`, payload)),
  remove: (id) => unwrap(http.delete(`/events/${id}`)),
};
