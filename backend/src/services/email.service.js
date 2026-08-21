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

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const BATCH_DELAY_MS = 600; // limite Resend : ~2 requêtes/seconde

export const siteUrl = () => process.env.FRONTEND_URL || "http://localhost:5173";
const mailFrom = () => process.env.MAIL_FROM || "ETDV <onboarding@resend.dev>";

/** URL publique du logo — une image hébergée s'affiche dans tous les clients mail,
 *  contrairement au base64 (>100 Ko) que Gmail rogne ou bloque. */
const logoUrl = () => process.env.EMAIL_LOGO_URL || `${siteUrl()}/etdv_logo.png`;

export const emailConfigured = () =>
  Boolean(process.env.BREVO_API_KEY || process.env.RESEND_API_KEY || process.env.SMTP_HOST);

/** Canal Brevo (API HTTPS, aucun port SMTP) — recommandé en production cloud. */
async function sendViaBrevo({ to, subject, html }) {
  // Tolère les guillemets/espaces collés autour de MAIL_FROM (erreur fréquente sur Render).
  const raw = (process.env.MAIL_FROM || "ETDV <phipsipy@gmail.com>")
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .trim();
  const match = raw.match(/^(.*?)\s*<(.+)>$/);
  const senderEmail = (match?.[2] || raw).trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
    throw new Error(
      `MAIL_FROM invalide (« ${raw} ») — format attendu : ETDV <phipsipy@gmail.com> sans guillemets.`
    );
  }
  const sender = { name: (match?.[1] || "ETDV").replace(/^["']+|["']+$/g, "").trim() || "ETDV", email: senderEmail };
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Échec Brevo (${response.status}) : ${body.slice(0, 200)}`);
  }
  return true;
}

let smtpTransporter = null;
function getSmtp() {
  if (!process.env.SMTP_HOST) return null;
  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: Number(process.env.SMTP_PORT || 465) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }
  return smtpTransporter;
}

/** Envoi bas niveau : Resend si configuré, sinon SMTP (Gmail…). Retourne true si accepté. */
export async function sendEmail({ to, subject, html }) {
  // Canal 1 — Brevo (API HTTPS)
  if (process.env.BREVO_API_KEY) {
    try {
      return await sendViaBrevo({ to, subject, html });
    } catch (err) {
      console.error(`[email] Échec Brevo pour ${to}:`, err.message);
      // On tente les canaux suivants avant d'abandonner.
    }
  }

  // Canal 2 — Resend
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

  // Canal 3 — SMTP (Gmail, Brevo relais, etc.)
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

/** Gabarit HTML de marque pour tous les emails ETDV.
 *  `message` = texte simple (les sauts de ligne sont respectés)
 *  ou `htmlBody` = contenu HTML prêt à l'emploi (ex. tableau de coordonnées). */
export function brandedHtml({ kicker, title, message, ctaLabel, ctaUrl, htmlBody, footerNote }) {
  const escape = (s = "") =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const paragraphs = message
    ? String(message)
        .split(/\n{2,}/)
        .map(
          (p) =>
            `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4b5563;">${escape(p).replace(/\n/g, "<br/>")}</p>`
        )
        .join("")
    : "";
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8" /><meta name="color-scheme" content="light only" /></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escape(title)} — Temple du Dieu Vivant</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e6e6;box-shadow:0 1px 3px rgba(0,0,0,.06);">
        <tr><td style="height:5px;background:#37cdbe;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:30px 36px 4px;" align="center">
          <img src="${logoUrl()}" alt="ETDV — Temple du Dieu Vivant" width="64" height="64" style="display:block;border-radius:9999px;" />
          <p style="margin:12px 0 0;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#6b7280;">Temple du Dieu Vivant</p>
        </td></tr>
        <tr><td style="padding:14px 36px 8px;">
          ${kicker ? `<p style="margin:0 0 10px;"><span style="display:inline-block;background:#e6f7f5;color:#1d857a;font-size:11px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;padding:5px 12px;border-radius:999px;">${escape(kicker)}</span></p>` : ""}
          <h1 style="margin:0 0 18px;font-size:22px;line-height:1.3;color:#111827;">${escape(title)}</h1>
          ${htmlBody || paragraphs}
          ${
            ctaUrl
              ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 4px;"><tr><td bgcolor="#37cdbe" style="border-radius:10px;">
                   <a href="${ctaUrl}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;">${escape(ctaLabel || "Voir sur le site")}</a>
                 </td></tr></table>`
              : ""
          }
        </td></tr>
        <tr><td style="padding:26px 36px 24px;">
          <hr style="border:none;border-top:1px solid #e5e6e6;margin:0 0 14px;" />
          <p style="margin:0;font-size:11px;line-height:1.6;color:#9ca3af;">
            ${escape(footerNote || "Vous recevez cet email car vous êtes abonné aux actualités du Temple du Dieu Vivant.")}
            <br/><a href="${siteUrl()}" style="color:#2f9e93;text-decoration:none;">${(() => { try { return new URL(siteUrl()).host; } catch { return siteUrl(); } })()}</a> · Église Temple du Dieu Vivant — Lomé, Togo
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
  const escape = (s = "") =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const field = (label, value) => `
        <tr>
          <td style="padding:9px 14px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap;border-bottom:1px solid #f3f4f6;width:90px;">${escape(label)}</td>
          <td style="padding:9px 14px;font-size:14px;font-weight:bold;color:#111827;border-bottom:1px solid #f3f4f6;">${escape(value || "—")}</td>
        </tr>`;
  const htmlBody = `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e6e6;border-radius:10px;overflow:hidden;margin:0 0 18px;">
            ${field("Nom", name)}${field("Email", email)}${field("Sujet", subject)}
          </table>
          <div style="background:#f9fafb;border-left:3px solid #37cdbe;border-radius:8px;padding:16px 18px;">
            <p style="margin:0 0 8px;font-size:11px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:#6b7280;">Message</p>
            <p style="margin:0;font-size:15px;line-height:1.75;color:#374151;">${escape(message).replace(/\n/g, "<br/>")}</p>
          </div>`;
  const html = brandedHtml({
    kicker: "Nouveau message de contact",
    title: subject || `Message de ${name}`,
    htmlBody,
    ctaLabel: `Répondre à ${name}`,
    ctaUrl: `mailto:${email}?subject=${encodeURIComponent(`Re: ${subject || "Votre message"}`)}`,
    footerNote: "Email interne — notification d'un message reçu via le formulaire de contact du site.",
  });
  await sendEmail({ to, subject: `[Contact] ${subject || name}`, html });
}
