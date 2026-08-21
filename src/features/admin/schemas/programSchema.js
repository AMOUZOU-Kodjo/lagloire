import { z } from "zod";
import { PROGRAM_TYPES } from "../../../lib/constants";

export const programSchema = z.object({
  title: z.string().min(3, "Titre requis (min 3 caractères)"),
  description: z.string().optional(),
  type: z.enum(PROGRAM_TYPES),
  startDate: z.string().min(1, "Date de début requise"),
  endDate: z.string().optional(),
  location: z.string().optional(),
});

export const programDefaultValues = {
  title: "",
  description: "",
  type: "HEBDOMADAIRE",
  startDate: "",
  endDate: "",
  location: "",
};