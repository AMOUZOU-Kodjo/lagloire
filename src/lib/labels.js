// Libellés FR et tonalités de badge par enum backend.
// Objectif : AUCUN enum brut ("EN_DIRECT", "PLANIFIE"…) ne doit s'afficher à l'écran.

const LABELS = {
  EVENT: {
    CULTE: "Culte",
    CONFERENCE: "Conférence",
    REUNION: "Réunion",
    BAPTEME: "Baptême",
    MARIAGE: "Mariage",
    JEUNE: "Jeûne & prière",
    FORMATION: "Formation",
    AUTRE: "Autre",
  },
  EVENT_STATUS: {
    PLANIFIE: "Planifié",
    EN_COURS: "En cours",
    TERMINE: "Terminé",
    ANNULE: "Annulé",
  },
  PROGRAM_TYPE: {
    ANNUEL: "Annuel",
    MENSUEL: "Mensuel",
    HEBDOMADAIRE: "Hebdomadaire",
    JOURNALIER: "Journalier",
  },
  MEDIA_TYPE: {
    PHOTO: "Photo",
    AUDIO: "Audio",
    VIDEO: "Vidéo",
  },
  PAYMENT_METHOD: {
    FLOOZ: "Flooz",
    TMONEY: "TMoney",
    PAYPAL: "PayPal",
    CARTE: "Carte bancaire",
  },
  DONATION_TYPE: {
    OFFRANDE: "Offrande",
    DIME: "Dîme",
    PROJET: "Projet",
  },
  DONATION_STATUS: {
    EN_ATTENTE: "En attente",
    CONFIRME: "Confirmé",
  },
  REGISTRATION_STATUS: {
    EN_ATTENTE: "En attente",
    VALIDE: "Validé",
    ANNULE: "Annulé",
  },
  LIVE_TYPE: {
    INTERNE: "Diffusion interne",
    YOUTUBE: "YouTube",
  },
  LIVE_STATUS: {
    PLANIFIE: "Planifié",
    EN_DIRECT: "En direct",
    TERMINE: "Terminé",
  },
  PRAYER_STATUS: {
    BROUILLON: "Brouillon",
    EN_ATTENTE: "File d'attente",
    PUBLIE: "Publiée",
  },
  NOTIFICATION_TYPE: {
    MESSAGE: "Message",
    EVENT: "Événement",
    PROGRAM: "Programme",
    PRAYER: "Prière",
    LIVE: "Direct",
  },
  MINISTRY: {
    PASTEUR_TITULAIRE: "Pasteur titulaire",
    PASTEUR_ADJOINT: "Pasteur adjoint",
    APOTRE: "Apôtre",
    DIACRE: "Diacre",
    DIACONESSE: "Diaconesse",
    MAMAN_PASTEUR: "Maman pasteur",
    EVANGELISTE: "Évangéliste",
    ENSEIGNANT: "Enseignant",
    RESPONSABLE_JEUNESSE: "Responsable jeunesse",
    RESPONSABLE_ADORATION: "Responsable adoration",
    AUCUN: "Aucun",
  },
};

// Tonalités de badge par enum (clés "tone" du composant Badge).
const TONES = {
  EVENT_STATUS: { PLANIFIE: "gold", EN_COURS: "brick", TERMINE: "muted", ANNULE: "muted" },
  DONATION_STATUS: { EN_ATTENTE: "gold", CONFIRME: "palm" },
  REGISTRATION_STATUS: { EN_ATTENTE: "gold", VALIDE: "palm", ANNULE: "muted" },
  LIVE_STATUS: { PLANIFIE: "gold", EN_DIRECT: "brick", TERMINE: "muted" },
  PRAYER_STATUS: { BROUILLON: "muted", EN_ATTENTE: "gold", PUBLIE: "palm" },
};

/** Retourne le libellé FR d'un enum, avec fallback sur la valeur brute. */
export function label(kind, value) {
  if (!value) return "";
  return LABELS[kind]?.[value] ?? value;
}

/** Retourne la tonalité de badge d'un enum de statut. */
export function tone(kind, value) {
  return TONES[kind]?.[value] ?? "muted";
}

/** Libellé + tonalité groupés pour un statut donné. */
export function statusLabel(kind, value) {
  return { label: label(kind, value), tone: tone(kind, value) };
}