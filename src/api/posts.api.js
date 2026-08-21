import { http, unwrap } from "./http";

export const postsApi = {
  list: (params) => unwrap(http.get("/posts", { params })),
  getById: (id) => unwrap(http.get(`/posts/${id}`)),
  create: (payload) => unwrap(http.post("/posts", payload)),
  update: (id, payload) => unwrap(http.put(`/posts/${id}`, payload)),
  remove: (id) => unwrap(http.delete(`/posts/${id}`)),
  markRead: (id) => unwrap(http.post(`/posts/${id}/read`)),
  readers: (id) => unwrap(http.get(`/posts/${id}/readers`)),
  categories: () => unwrap(http.get("/posts/categories")),
  createCategory: (name) => unwrap(http.post("/posts/categories", { name })),
};
