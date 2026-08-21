import { z } from "zod";
import { GENDERS, MARITAL_STATUSES } from "../../../lib/constants";

export const profileSchema = z.object({
  bio: z.string().optional(),
  city: z.string().optional(),
  gender: z.union([z.literal(""), z.enum(GENDERS)]).optional(),
  maritalStatus: z.union([z.literal(""), z.enum(MARITAL_STATUSES)]).optional(),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Mot de passe actuel requis (min 6 caractères)"),
    newPassword: z.string().min(6, "Nouveau mot de passe (min 6 caractères)"),
  })
  .refine((values) => values.currentPassword !== values.newPassword, {
    path: ["newPassword"],
    message: "Le nouveau mot de passe doit être différent",
  });

/** Définition initiale d'un mot de passe (compte créé par code OTP — pas de mot de passe actuel). */
export const setPasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "Mot de passe (min 6 caractères)"),
});