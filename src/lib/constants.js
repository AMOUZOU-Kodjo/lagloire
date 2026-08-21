// Miroir des enums définis côté backend (schema.prisma)

export const ROLES = {
  ADMIN: "ADMIN",
  APOTRE: "APOTRE",
  PASTEUR: "PASTEUR",
  FIDELES: "FIDELES",
  VISITEUR: "VISITEUR",
};

export const ROLE_LABELS = {
  ADMIN: "Admin",
  APOTRE: "Apôtre",
  PASTEUR: "Pasteur",
  FIDELES: "Fidèle",
  VISITEUR: "Visiteur",
};

// Rôles pouvant accéder au back-office (aligné sur authorize("ADMIN","APOTRE","PASTEUR") des routes)
export const STAFF_ROLES = [ROLES.ADMIN, ROLES.APOTRE, ROLES.PASTEUR];
export const MANAGE_ROLES = [ROLES.ADMIN, ROLES.APOTRE]; // media/posts management, moderation

// Pages du back-office autorisées par rôle (chemins "/admin/*") — miroir des requireRole backend.
export const ADMIN_ACCESS = {
  [ROLES.ADMIN]: [
    "/admin",
    "/admin/utilisateurs",
    "/admin/medias",
    "/admin/moderation",
    "/admin/dons-contacts",
    "/admin/abonnes",
    "/admin/eglises",
    "/admin/evenements",
    "/admin/programmes",
    "/admin/direct",
    "/admin/prieres",
  ],
  [ROLES.APOTRE]: [
    "/admin",
    "/admin/utilisateurs",
    "/admin/medias",
    "/admin/moderation",
    "/admin/dons-contacts",
    "/admin/abonnes",
    "/admin/eglises",
    "/admin/evenements",
    "/admin/programmes",
    "/admin/direct",
    "/admin/prieres",
  ],
  [ROLES.PASTEUR]: [
    "/admin",
    "/admin/dons-contacts",
    "/admin/eglises",
    "/admin/evenements",
    "/admin/programmes",
    "/admin/direct",
    "/admin/prieres",
  ],
};

/** Vrai si le rôle peut accéder à une page du back-office donnée. */
export const canAccessAdminPage = (role, path) => ADMIN_ACCESS[role]?.includes(path) ?? false;

export const MINISTRIES = [
  "PASTEUR_TITULAIRE",
  "PASTEUR_ADJOINT",
  "APOTRE",
  "DIACRE",
  "DIACONESSE",
  "MAMAN_PASTEUR",
  "EVANGELISTE",
  "ENSEIGNANT",
  "RESPONSABLE_JEUNESSE",
  "RESPONSABLE_ADORATION",
  "AUCUN",
];

export const GENDERS = ["HOMME", "FEMME"];
export const MARITAL_STATUSES = ["CELIBATAIRE", "MARIE", "DIVORCE", "VEUF"];

export const EVENT_TYPES = ["CULTE", "CONFERENCE", "REUNION", "BAPTEME", "MARIAGE", "JEUNE", "FORMATION", "AUTRE"];
export const EVENT_STATUSES = ["PLANIFIE", "EN_COURS", "TERMINE", "ANNULE"];

export const PROGRAM_TYPES = ["ANNUEL", "MENSUEL", "HEBDOMADAIRE", "JOURNALIER"];

export const MEDIA_TYPES = ["PHOTO", "AUDIO", "VIDEO"];

export const PAYMENT_METHODS = ["FLOOZ", "TMONEY", "PAYPAL", "CARTE"];
export const DONATION_TYPES = ["OFFRANDE", "DIME", "PROJET"];
export const DONATION_STATUSES = ["EN_ATTENTE", "CONFIRME"];

export const REGISTRATION_STATUSES = ["EN_ATTENTE", "VALIDE", "ANNULE"];

export const LIVE_TYPES = ["INTERNE", "YOUTUBE"];
export const LIVE_STATUSES = ["PLANIFIE", "EN_DIRECT", "TERMINE"];

export const NOTIFICATION_TYPES = ["MESSAGE", "EVENT", "PROGRAM", "PRAYER", "LIVE"];
