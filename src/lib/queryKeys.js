// Clés de requête centralisées — à utiliser dans TOUS les useQuery/useMutation.
// Aucune chaîne de queryKey en dur dans les composants.

const paginated = (base, params) => [base, "list", params];
const detail = (base, id) => [base, "detail", id];

export const queryKeys = {
  auth: { me: ["auth", "me"] },
  users: {
    all: ["users"],
    list: (params) => paginated("users", params),
    detail: (id) => detail("users", id),
  },
  churches: {
    all: ["churches"],
    list: (params) => paginated("churches", params),
    detail: (id) => detail("churches", id),
  },
  events: {
    all: ["events"],
    list: (params) => paginated("events", params),
    detail: (id) => detail("events", id),
  },
  registrations: {
    all: ["registrations"],
    list: (params) => paginated("registrations", params),
  },
  programs: {
    all: ["programs"],
    list: (params) => paginated("programs", params),
    detail: (id) => detail("programs", id),
  },
  posts: {
    all: ["posts"],
    list: (params) => paginated("posts", params),
    detail: (id) => detail("posts", id),
  },
  media: {
    all: ["media"],
    list: (params) => paginated("media", params),
    pending: ["media", "pending"],
  },
  prayers: {
    all: ["prayers"],
    today: ["prayers", "today"],
  },
  live: {
    all: ["live"],
    list: (params) => paginated("live", params),
    current: ["live", "current"],
    detail: (id) => detail("live", id),
  },
  donations: {
    all: ["donations"],
    list: (params) => paginated("donations", params),
    mine: ["donations", "mine"],
  },
  contacts: {
    all: ["contacts"],
    list: (params) => paginated("contacts", params),
  },
  subscriptions: {
    all: ["subscriptions"],
    list: (params) => paginated("subscriptions", params),
  },
  notifications: {
    all: ["notifications"],
    list: (params) => paginated("notifications", params),
  },
  chat: {
    all: ["chat"],
    conversations: ["chat", "conversations"],
    room: (roomId) => ["chat", "room", roomId],
  },
  stats: {
    all: ["stats"],
    dashboard: ["stats", "dashboard"],
  },
};