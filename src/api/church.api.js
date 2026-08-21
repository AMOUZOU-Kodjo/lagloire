import { http, unwrap } from "./http";

export const churchApi = {
  list: () => unwrap(http.get("/churches")),
  getById: (id) => unwrap(http.get(`/churches/${id}`)),
  create: (payload) => unwrap(http.post("/churches", payload)),
  update: (id, payload) => unwrap(http.put(`/churches/${id}`, payload)),
  remove: (id) => unwrap(http.delete(`/churches/${id}`)),

  leadership: (params) => unwrap(http.get("/churches/directory/leadership", { params })),
  members: (params) => unwrap(http.get("/churches/directory/members", { params })),
  visitors: (params) => unwrap(http.get("/churches/directory/visitors", { params })),
};
