import { z } from "zod";
import { EVENT_TYPES } from "../../../lib/constants";

export const eventSchema = z.object({
  title: z.string().min(3, "Titre requis (min 3 caractères)"),
  description: z.string().optional(),
  date: z.string().min(1, "Date requise"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(EVENT_TYPES),
  maxCapacity: z.union([z.literal(""), z.coerce.number().int().min(1, "Capacité invalide")]).optional(),
});

export const eventDefaultValues = {
  title: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  location: "",
  type: "CULTE",
  maxCapacity: "",
};