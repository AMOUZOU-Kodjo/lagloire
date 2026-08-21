import { z } from "zod";

export const churchSchema = z.object({
  name: z.string().min(2, "Nom requis (min 2 caractères)"),
  city: z.string().min(1, "Ville requise"),
  country: z.string().min(1, "Pays requis"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([z.literal(""), z.email("Email invalide")]).optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const churchDefaultValues = {
  name: "",
  city: "",
  country: "Togo",
  address: "",
  phone: "",
  email: "",
  description: "",
  imageUrl: "",
};