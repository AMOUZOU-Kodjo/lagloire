import { prisma } from "../lib/prisma.js";
import { notifySubscribers, prayerEmailBody, siteUrl } from "./email.service.js";

/**
 * Planificateur de prières matinales (sans dépendance externe).
 *
 * Les prières en statut EN_ATTENTE forment une file d'attente. Chaque jour, à
 * l'heure configurée (fuseau Africa/Lome), la première prière éligible est
 * publiée automatiquement et envoyée par email aux abonnés newsletter.
 *
 * Variables d'environnement :
 *  - PRAYER_AUTO_ENABLED : "true" (défaut) | "false"
 *  - PRAYER_AUTO_HOUR    : heure de publication (défaut 5)
 *  - PRAYER_AUTO_MINUTE  : minute de publication (défaut 0)
 */

const TZ = "Africa/Lome";
const CHECK_INTERVAL_MS = 30_000;

let lastRunDate = null;
let timer = null;
let running = false;

const enabled = () => String(process.env.PRAYER_AUTO_ENABLED ?? "true") !== "false";
const targetHour = () => Math.min(23, Math.max(0, Number(process.env.PRAYER_AUTO_HOUR ?? 5)));
const targetMinute = () => Math.min(59, Math.max(0, Number(process.env.PRAYER_AUTO_MINUTE ?? 0)));

/** Date (YYYY-MM-DD) et minutes locales dans le fuseau de Lomé. */
function localNow() {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: TZ,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type)?.value ?? "0";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

/** Publie la prochaine prière en attente (celle planifiée en premier, sinon la plus ancienne). */
export async function publishNextPrayer() {
  const now = new Date();
  const next = await prisma.morningPrayer.findFirst({
    where: {
      status: "EN_ATTENTE",
      OR: [{ scheduledFor: null }, { scheduledFor: { lte: now } }],
    },
    orderBy: [{ scheduledFor: { sort: "asc", nulls: "first" } }, { createdAt: "asc" }],
  });
  if (!next) return null;

  const prayer = await prisma.morningPrayer.update({
    where: { id: next.id },
    data: { status: "PUBLIE", publishedAt: now },
  });

  await notifySubscribers({
    kicker: "Prière matinale",
    title: prayer.title,
    htmlBody: prayerEmailBody(prayer),
    ctaLabel: "Lire la prière",
    ctaUrl: `${siteUrl()}/prieres-matinales`,
  }).catch((err) => console.warn("[scheduler] Email prière non envoyé :", err.message));

  console.log(`[scheduler] Prière publiée automatiquement : « ${prayer.title} »`);
  return prayer;
}

async function tick() {
  if (!enabled() || running) return;
  const { date, minutes } = localNow();
  if (minutes < targetHour() * 60 + targetMinute() || lastRunDate === date) return;

  running = true;
  try {
    // Idempotence : si une prière a déjà été publiée aujourd'hui (même après
    // un redémarrage du serveur), on ne republie pas une seconde fois.
    // Lomé est en UTC+0 : minuit local = minuit UTC.
    const startOfLocalDay = new Date(`${date}T00:00:00.000Z`);
    const alreadyToday = await prisma.morningPrayer.findFirst({
      where: { status: "PUBLIE", publishedAt: { gte: startOfLocalDay } },
      select: { id: true },
    });
    lastRunDate = date;
    if (alreadyToday) {
      console.log("[scheduler] Une prière est déjà publiée aujourd'hui — rien à faire.");
      return;
    }
    await publishNextPrayer();
  } catch (err) {
    console.error("[scheduler] Échec publication :", err.message);
  } finally {
    running = false;
  }
}

export function startScheduler() {
  if (timer) return;
  timer = setInterval(tick, CHECK_INTERVAL_MS);
  const hh = String(targetHour()).padStart(2, "0");
  const mm = String(targetMinute()).padStart(2, "0");
  console.log(
    enabled()
      ? `[scheduler] Prière matinale automatique chaque jour à ${hh}:${mm} (${TZ})`
      : "[scheduler] Désactivé (PRAYER_AUTO_ENABLED=false)"
  );
}
