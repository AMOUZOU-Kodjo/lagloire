import { http, unwrap } from "./http";

export const usersApi = {
  list: (params) => unwrap(http.get("/users", { params })),
  getById: (id) => unwrap(http.get(`/users/${id}`)),
  create: (payload) => unwrap(http.post("/users", payload)),
  update: (id, payload) => unwrap(http.put(`/users/${id}`, payload)),
  remove: (id) => unwrap(http.delete(`/users/${id}`)),
  updateProfile: (payload) => unwrap(http.put("/users/profile/me", payload)),
  deleteAvatar: () => unwrap(http.delete("/users/profile/avatar")),
  changePassword: (payload) => unwrap(http.put("/users/password/me", payload)),
  visitStats: (id) => unwrap(http.get(`/users/${id ?? ""}/visits`)),
};
