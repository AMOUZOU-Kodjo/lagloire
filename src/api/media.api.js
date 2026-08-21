import { http, unwrap } from "./http";

export const mediaApi = {
  list: (params) => unwrap(http.get("/media", { params })),
  getById: (id) => unwrap(http.get(`/media/${id}`)),
  create: (payload) => unwrap(http.post("/media", payload)),
  approve: (id) => unwrap(http.put(`/media/approve/${id}`)),
  update: (id, payload) => unwrap(http.put(`/media/${id}`, payload)),
  remove: (id) => unwrap(http.delete(`/media/${id}`)),
  toggleVisibility: (id) => unwrap(http.patch(`/media/${id}/visibility`)),
  pending: () => unwrap(http.get("/media/pending")),
  mine: () => unwrap(http.get("/media/mine")),
  manage: (params) => unwrap(http.get("/media/manage", { params })),
  upload: (file) => {
    const form = new FormData();
    form.append("file", file);
    return unwrap(http.post("/upload", form, { headers: { "Content-Type": "multipart/form-data" } }));
  },
};
