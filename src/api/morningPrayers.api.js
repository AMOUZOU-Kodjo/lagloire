import { http, unwrap } from "./http";

export const morningPrayersApi = {
  list: (params) => unwrap(http.get("/prieres-matinales", { params })),
  getById: (id) => unwrap(http.get(`/prieres-matinales/${id}`)),
  create: (payload) => unwrap(http.post("/prieres-matinales", payload)),
  update: (id, payload) => unwrap(http.put(`/prieres-matinales/${id}`, payload)),
  remove: (id) => unwrap(http.delete(`/prieres-matinales/${id}`)),
  generate: (count) => unwrap(http.post("/prieres-matinales/generate", { count })),
};
