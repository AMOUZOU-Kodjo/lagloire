import { http, unwrap } from "./http";

export const programsApi = {
  list: (params) => unwrap(http.get("/programs", { params })),
  getById: (id) => unwrap(http.get(`/programs/${id}`)),
  dailyVerse: () => unwrap(http.get("/programs/daily-verse")),
  create: (payload) => unwrap(http.post("/programs", payload)),
  update: (id, payload) => unwrap(http.put(`/programs/${id}`, payload)),
  remove: (id) => unwrap(http.delete(`/programs/${id}`)),
};
