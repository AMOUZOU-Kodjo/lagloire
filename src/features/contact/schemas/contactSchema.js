import { z } from "zod";

export const contactSchema = z
  .object({
    name: z.string().min(2, "Nom requis (min 2 caractères)"),
    email: z.email("Email invalide"),
    subject: z.string().min(3, "Sujet requis (min 3 caractères)"),
    message: z.string().min(10, "Message requis (min 10 caractères)"),
    recipientType: z.enum(["APOTRE", "PASTEUR"]),
    recipientId: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.recipientType === "PASTEUR" && !values.recipientId) {
      ctx.addIssue({ path: ["recipientId"], message: "Choisissez un pasteur" });
    }
  });

export const contactDefaultValues = {
  name: "",
  email: "",
  subject: "",
  message: "",
  recipientType: "APOTRE",
  recipientId: "",
};