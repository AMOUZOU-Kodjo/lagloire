import { z } from "zod";
import { DONATION_TYPES, PAYMENT_METHODS } from "../../../lib/constants";

export const donationSchema = z
  .object({
    type: z.enum(DONATION_TYPES),
    amount: z.coerce.number().min(1, "Montant invalide"),
    customAmount: z.string().optional(),
    churchId: z.string().optional(),
    method: z.enum(PAYMENT_METHODS),
    phone: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if ((values.method === "FLOOZ" || values.method === "TMONEY") && !values.phone?.trim()) {
      ctx.addIssue({ path: ["phone"], message: "Numéro requis pour ce mode de paiement" });
    }
  });

export const donationDefaultValues = {
  type: "OFFRANDE",
  amount: 5000,
  customAmount: "",
  churchId: "",
  method: "FLOOZ",
  phone: "",
};