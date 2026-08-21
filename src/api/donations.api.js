import { http, unwrap } from "./http";

export const donationsApi = {
  create: (payload) => unwrap(http.post("/donations", payload)),
  mine: (params) => unwrap(http.get("/donations/me", { params })),
  all: (params) => unwrap(http.get("/donations", { params })),
  confirm: (id) => unwrap(http.put(`/donations/${id}/confirm`)),
};
