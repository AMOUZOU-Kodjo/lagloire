import { z } from "zod";
import { PROGRAM_TYPES } from "../../../lib/constants";

export const WEEKDAYS = [
  { value: "1", label: "Lundi" },
  { value: "2", label: "Mardi" },
  { value: "3", label: "Mercredi" },
  { value: "4", label: "Jeudi" },
  { value: "5", label: "Vendredi" },
  { value: "6", label: "Samedi" },
  { value: "0", label: "Dimanche" },
];

export const programSchema = z.object({
  title: z.string().min(3, "Titre requis (min 3 caractères)"),
  description: z.string().optional(),
  type: z.enum(PROGRAM_TYPES),
  startDate: z.string().min(1, "Date de début requise"),
  endDate: z.string().optional(),
  location: z.string().optional(),
  dayOfWeek: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

export const programDefaultValues = {
  title: "",
  description: "",
  type: "HEBDOMADAIRE",
  startDate: "",
  endDate: "",
  location: "",
  dayOfWeek: "",
  startTime: "",
  endTime: "",
};
