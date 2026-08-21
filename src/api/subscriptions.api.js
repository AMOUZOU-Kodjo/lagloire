import { http, unwrap } from "./http";

export const subscriptionsApi = {
  subscribe: (payload) => unwrap(http.post("/subscriptions", payload)),
  unsubscribe: (email) => unwrap(http.post("/subscriptions/unsubscribe", { email })),
  list: (params) => unwrap(http.get("/subscriptions", { params })),
  setStatus: (id, active) => unwrap(http.patch(`/subscriptions/${id}`, { active })),
};
