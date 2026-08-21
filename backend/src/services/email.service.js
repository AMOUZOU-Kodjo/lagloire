// Service d'emails transactionnels — deux canaux possibles, sans domaine obligatoire :
//   1) Resend (API REST) si RESEND_API_KEY est définie
//   2) SMTP générique (ex. Gmail : smtp.gmail.com, port 465, mot de passe d'application)
//      si SMTP_HOST/SMTP_USER/SMTP_PASS sont définis
// Variables d'environnement :
//   RESEND_API_KEY       — clé API (https://resend.com/api-keys)
//   MAIL_FROM            — expéditeur ("ETDV <no-reply@domaine>")
//   CONTACT_NOTIFY_EMAIL — boîte qui reçoit les messages du formulaire de contact
//   FRONTEND_URL         — origine du site pour les liens (défaut http://localhost:5173)

import { prisma } from "../lib/prisma.js";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const BATCH_DELAY_MS = 600; // limite Resend : ~2 requêtes/seconde

export const siteUrl = () => process.env.FRONTEND_URL || "http://localhost:5173";
const mailFrom = () => process.env.MAIL_FROM || "ETDV <onboarding@resend.dev>";

/** Logo encodé en base64 pour l'inclure directement dans les emails (visible partout). */
let logoDataUri = null;
function getLogoDataUri() {
  if (logoDataUri !== null) return logoDataUri;
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const logoPath = path.resolve(__dirname, "../../../public/etdv_logo.png");
    logoDataUri = `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`;
  } catch {
    console.warn("[email] Logo introuvable sur le disque — il ne sera pas intégré aux emails.");
    logoDataUri = "";
  }
  return logoDataUri;
}

export const emailConfigured = () =>
  Boolean(process.env.RESEND_API_KEY || process.env.SMTP_HOST);

let smtpTransporter = null;
function getSmtp() {
  if (!process.env.SMTP_HOST) return null;
  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: Number(process.env.SMTP_PORT || 465) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return smtpTransporter;
}

/** Envoi bas niveau : Resend si configuré, sinon SMTP (Gmail…). Retourne true si accepté. */
export async function sendEmail({ to, subject, html }) {
  // Canal 1 — Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch(RESEND_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: mailFrom(), to: Array.isArray(to) ? to : [to], subject, html }),
      });
      if (res.ok) return true;
      const detail = await res.text().catch(() => "");
      console.error(`[email] Échec Resend (${res.status}) pour ${to}: ${detail.slice(0, 200)}`);
    } catch (err) {
      console.error("[email] Erreur réseau Resend:", err.message);
    }
  }

  // Canal 2 — SMTP (Gmail, Brevo relais, etc.)
  const transporter = getSmtp();
  if (transporter) {
    try {
      await transporter.sendMail({ from: mailFrom(), to, subject, html });
      return true;
    } catch (err) {
      console.error(`[email] Échec SMTP pour ${to}:`, err.message);
      return false;
    }
  }

  console.log(`[email] Aucun canal configuré — email non envoyé à ${to} (« ${subject} »)`);
  return false;
}

/** Gabarit HTML de marque pour tous les emails ETDV. */
export function brandedHtml({ kicker, title, message, ctaLabel, ctaUrl }) {
  const escape = (s = "") =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<!doctype html>
<html lang="fr"><body style="margin:0;padding:0;background:#f2f2f2;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e6e6;">
        <tr><td style="height:4px;background:#37cdbe;"></td></tr>
        <tr><td style="padding:28px 32px 8px;" align="center">
          <img src="${getLogoDataUri() || `${siteUrl()}/etdv_logo.png`}" alt="ETDV" width="56" height="56" style="border-radius:9999px;display:inline-block;" />
          <p style="margin:10px 0 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#6b7280;">Temple du Dieu Vivant</p>
        </td></tr>
        <tr><td style="padding:8px 32px 0;">
          ${kicker ? `<p style="margin:0 0 6px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#2f9e93;font-weight:bold;">${escape(kicker)}</p>` : ""}
          <h1 style="margin:0 0 14px;font-size:22px;line-height:1.25;color:#1f2937;">${escape(title)}</h1>
          <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#4b5563;">${escape(message)}</p>
          ${
            ctaUrl
              ? `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="#37cdbe" style="border-radius:10px;">
                   <a href="${ctaUrl}" style="display:inline-block;padding:12px 26px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;">${escape(ctaLabel || "Voir sur le site")}</a>
                 </td></tr></table>`
              : ""
          }
        </td></tr>
        <tr><td style="padding:26px 32px 20px;">
          <hr style="border:none;border-top:1px solid #e5e6e6;margin:0 0 12px;" />
          <p style="margin:0;font-size:11px;color:#9ca3af;">
            Vous recevez cet email car vous êtes abonné aux actualités du Temple du Dieu Vivant.
            <br/><a href="${siteUrl()}" style="color:#2f9e93;">etdv.org</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/**
 * Notifie tous les abonnés actifs (newsletter) — appel non bloquant.
 * Les envois sont séquentiels avec un délai pour respecter la limite Resend.
 */
export async function notifySubscribers({ kicker, title, message, ctaUrl, ctaLabel }) {
  try {
    const subs = await prisma.subscription.findMany({
      where: { active: true },
      select: { email: true },
    });
    if (subs.length === 0) return;

    const html = brandedHtml({ kicker, title, message, ctaUrl, ctaLabel });
    for (const [i, sub] of subs.entries()) {
      await sendEmail({ to: sub.email, subject: `${title} — Temple du Dieu Vivant`, html });
      if (i < subs.length - 1) await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
    console.log(`[email] Notification « ${title} » envoyée à ${subs.length} abonné(s).`);
  } catch (err) {
    console.error("[email] notifySubscribers a échoué:", err.message);
  }
}

/** Notifie l'équipe (boîte de réception) qu'un nouveau message de contact est arrivé. */
export async function notifyStaffContact({ name, email, subject, message }) {
  const to = process.env.CONTACT_NOTIFY_EMAIL;
  if (!to) {
    console.log("[email] CONTACT_NOTIFY_EMAIL absente — message de contact non transféré.");
    return;
  }
  const html = brandedHtml({
    kicker: "Nouveau message de contact",
    title: subject || `Message de ${name}`,
    message: `${name} (${email}) écrit : « ${message} ». Répondre directement à cette adresse email.`,
  });
  await sendEmail({ to, subject: `[Contact] ${subject || name}`, html });
}
