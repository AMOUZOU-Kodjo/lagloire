import { http, unwrap } from "./http";

export const contactApi = {
  send: (payload) => unwrap(http.post("/contact", payload)),
  list: (params) => unwrap(http.get("/contact", { params })),
  markRead: (id) => unwrap(http.put(`/contact/${id}/read`)),
  remove: (id) => unwrap(http.delete(`/contact/${id}`)),
};
