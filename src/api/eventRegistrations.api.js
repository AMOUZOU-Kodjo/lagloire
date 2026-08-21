import { http, unwrap } from "./http";

export const eventRegistrationsApi = {
  register: (eventId) => unwrap(http.post(`/events/${eventId}/register`)),
  validate: (registrationId) => unwrap(http.put(`/registrations/${registrationId}/validate`)),
  receipt: (registrationId) => unwrap(http.get(`/registrations/${registrationId}/receipt`)),
  myRegistrations: () => unwrap(http.get("/registrations/me")),
  forEvent: (eventId, params) => unwrap(http.get(`/events/${eventId}/registrations`, { params })),
  cancel: (registrationId) => unwrap(http.delete(`/registrations/${registrationId}`)),
};
