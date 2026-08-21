import nodemailer from "nodemailer";

/** Génère un code OTP à 6 chiffres. */
export const generateCode = () =>
  String(Math.floor(100000 + Math.random() * 900000));

let transporter = null;

/** Configure le transporteur SMTP si les variables sont présentes. */
const getTransporter = () => {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST) return null;
  const port = Number(process.env.SMTP_PORT) || 587;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465, // 465 = TLS implicite ; 587 = STARTTLS
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  return transporter;
};

/**
 * Envoie un code OTP.
 * - SMTP configuré (production) : envoi par email.
 * - Sinon (développement) : affiche le code dans les logs du serveur.
 */
export async function sendOtpEmail(email, code) {
  const t = getTransporter();
  if (t) {
    await t.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_FROM || "ETDV <no-reply@etdv.tg>",
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
    return;
  }
  // Développement : le code est loggé pour pouvoir se connecter localement.
  console.log(`[OTP] ${email} → code: ${code}`);
}