import { z } from "zod";

export const PRAYER_STATUSES = ["BROUILLON", "EN_ATTENTE", "PUBLIE"];

export const prayerSchema = z.object({
  title: z.string().min(3, "Titre requis (min 3 caractères)"),
  bibleVerse: z.string().optional(),
  content: z.string().min(10, "Contenu requis (min 10 caractères)"),
  status: z.enum(PRAYER_STATUSES),
  scheduledFor: z.string().optional(),
});

export const prayerDefaultValues = {
  title: "",
  bibleVerse: "",
  content: "",
  status: "EN_ATTENTE",
  scheduledFor: "",
};
