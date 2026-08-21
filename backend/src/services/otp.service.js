import { sendEmail } from "./email.service.js";

/** Génère un code OTP à 6 chiffres. */
export const generateCode = () =>
  String(Math.floor(100000 + Math.random() * 900000));

/**
 * Envoie un code OTP via le service email unifié (Brevo → Resend → SMTP).
 * Sans aucun canal configuré, sendEmail logge le code dans la console
 * pour permettre les connexions en développement local.
 */
export async function sendOtpEmail(email, code) {
  const sent = await sendEmail({
    to: email,
    subject: "Votre code de connexion ETDV",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e6e6;border-radius:14px">
        <h2 style="color:#37cdbe;margin:0 0 8px">Église Temple du Dieu Vivant</h2>
        <p style="color:#374151">Voici votre code de connexion :</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:6px;color:#1f2937;text-align:center;margin:16px 0">${code}</p>
        <p style="color:#6b7280;font-size:13px">Ce code expire dans 10 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      </div>`,
  });
  if (!sent) {
    throw new Error("Envoi de l'email impossible — vérifiez la configuration Brevo/SMTP sur le serveur.");
  }
}
