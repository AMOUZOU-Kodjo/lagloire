import { sendEmail, brandedHtml } from "./email.service.js";

/** Génère un code OTP à 6 chiffres. */
export const generateCode = () =>
  String(Math.floor(100000 + Math.random() * 900000));

/**
 * Envoie un code OTP via le service email unifié (Brevo → Resend → SMTP).
 * Sans aucun canal configuré, sendEmail logge le code dans la console
 * pour permettre les connexions en développement local.
 */
export async function sendOtpEmail(email, code) {
  const digits = String(code)
    .split("")
    .map(
      (d) =>
        `<td align="center" bgcolor="#f3f4f6" style="width:52px;height:60px;border-radius:10px;font-size:28px;font-weight:bold;color:#111827;">${d}</td>`
    )
    .join('<td style="width:10px;font-size:0;">&nbsp;</td>');
  const htmlBody = `
          <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#4b5563;">
            Bonjour,<br/>
            Voici votre code de connexion à <strong>l'Espace Membre</strong> du Temple du Dieu Vivant :
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:6px 0 20px;"><tr>${digits}</tr></table>
          <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:12px 16px;margin:0 0 6px;">
            <p style="margin:0;font-size:13px;line-height:1.6;color:#9a3412;">
              ⏳ Ce code expire dans <strong>10 minutes</strong>.<br/>
              🔒 Ne le partagez avec personne — l'église ne vous le demandera jamais par téléphone.
            </p>
          </div>`;
  const sent = await sendEmail({
    to: email,
    subject: "Votre code de connexion ETDV",
    html: brandedHtml({
      kicker: "Connexion sécurisée",
      title: "Votre code à 6 chiffres",
      htmlBody,
      footerNote:
        "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email — aucun compte ne sera créé sans ce code.",
    }),
  });
  if (!sent) {
    throw new Error("Envoi de l'email impossible — vérifiez la configuration Brevo/SMTP sur le serveur.");
  }
}
