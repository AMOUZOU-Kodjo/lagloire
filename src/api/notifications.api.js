import { http, unwrap } from "./http";

export const notificationsApi = {
  list: (params) => unwrap(http.get("/notifications", { params })),
  markRead: (id) => unwrap(http.put(`/notifications/${id}/read`)),
  markAllRead: () => unwrap(http.put("/notifications/read-all")),
  remove: (id) => unwrap(http.delete(`/notifications/${id}`)),
};
