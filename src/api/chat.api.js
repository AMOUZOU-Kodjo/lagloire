import { http, unwrap } from "./http";

export const chatApi = {
  startOrGet: (recipientId) => unwrap(http.post("/chat", { recipientId })),
  myConversations: () => unwrap(http.get("/chat")),
  contacts: () => unwrap(http.get("/chat/contacts")),
  messages: (roomId, params) => unwrap(http.get(`/chat/${roomId}`, { params })),
  send: (roomId, payload) => unwrap(http.post(`/chat/${roomId}/messages`, payload)),
  remove: (messageId) => unwrap(http.delete(`/chat/messages/${messageId}`)),
  markRead: (roomId) => unwrap(http.put(`/chat/${roomId}/read`)),
};
