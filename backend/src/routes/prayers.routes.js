import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { ok, AppError, asyncHandler } from "../lib/helpers.js";
import { requireAuth, requireRole, verifyToken } from "../middleware/auth.js";
import { notifySubscribers, prayerEmailBody, siteUrl } from "../services/email.service.js";
import { generatePrayers } from "../services/prayerGenerator.service.js";

const router = Router();
const STAFF = ["ADMIN", "APOTRE", "PASTEUR"];
const STATUSES = ["BROUILLON", "EN_ATTENTE", "PUBLIE"];

const prayerInclude = {
  author: { select: { firstName: true, lastName: true, role: true } },
};

/** Payload du token si l'appelant est staff, sinon null (lecture optionnelle). */
function staffFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const payload = verifyToken(authHeader.split(" ")[1]);
    return STAFF.includes(payload.role) ? payload : null;
  } catch {
    return null;
  }
}

function parseScheduledFor(value) {
  if (value === undefined) return undefined;
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new AppError(400, "Date de programmation invalide.");
  return date;
}

/** Email aux abonnés pour une prière qui vient d'être publiée. */
function sendPrayerEmail(prayer) {
  notifySubscribers({
    kicker: "Prière matinale",
    title: prayer.title,
    htmlBody: prayerEmailBody(prayer),
    ctaLabel: "Lire la prière",
    ctaUrl: `${siteUrl()}/prieres-matinales`,
  }).catch(() => {});
}

// GET /api/prieres-matinales?page&limit&scope=admin&status
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

    // Vue staff complète (?scope=admin), sinon uniquement les prières publiées.
    const staff = req.query.scope === "admin" ? staffFromRequest(req) : null;
    const where = {};
    if (staff) {
      if (req.query.status && STATUSES.includes(req.query.status)) where.status = req.query.status;
    } else {
      where.status = "PUBLIE";
    }

    const [prayers, total] = await Promise.all([
      prisma.morningPrayer.findMany({
        where,
        include: prayerInclude,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.morningPrayer.count({ where }),
    ]);

    const pages = Math.max(1, Math.ceil(total / limit));
    ok(res, prayers, { page, limit, pages, total });
  })
);

// GET /api/prieres-matinales/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const prayer = await prisma.morningPrayer.findUnique({
      where: { id: req.params.id },
      include: prayerInclude,
    });
    if (!prayer) throw new AppError(404, "Prière introuvable.");

    if (prayer.status !== "PUBLIE" && !staffFromRequest(req)) {
      throw new AppError(404, "Prière introuvable.");
    }

    ok(res, prayer);
  })
);

// POST /api/prieres-matinales/generate — staff : générer des prières automatiquement
router.post(
  "/generate",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const count = Math.min(31, Math.max(1, Number(req.body?.count) || 7));
    const created = await generatePrayers({ count, authorId: req.user.id });
    ok(res, created);
  })
);

// POST /api/prieres-matinales — staff
router.post(
  "/",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const { title, content, bibleVerse, status, scheduledFor } = req.body;
    if (!title || !content) throw new AppError(400, "Titre et contenu requis.");
    const finalStatus = status && STATUSES.includes(status) ? status : "EN_ATTENTE";
    const scheduled = parseScheduledFor(scheduledFor);

    const prayer = await prisma.morningPrayer.create({
      data: {
        title: String(title),
        content: String(content),
        bibleVerse: bibleVerse || null,
        status: finalStatus,
        scheduledFor: scheduled ?? null,
        publishedAt: finalStatus === "PUBLIE" ? new Date() : null,
        authorId: req.user.id,
      },
      include: prayerInclude,
    });

    // Publication immédiate → email tout de suite ; sinon le planificateur s'en charge.
    if (finalStatus === "PUBLIE") sendPrayerEmail(prayer);

    ok(res, prayer);
  })
);

// PUT /api/prieres-matinales/:id — staff
router.put(
  "/:id",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const existing = await prisma.morningPrayer.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, "Prière introuvable.");

    const { title, content, bibleVerse, status, scheduledFor } = req.body;
    const data = {};
    if (title !== undefined) data.title = String(title);
    if (content !== undefined) data.content = String(content);
    if (bibleVerse !== undefined) data.bibleVerse = bibleVerse || null;
    const scheduled = parseScheduledFor(scheduledFor);
    if (scheduled !== undefined) data.scheduledFor = scheduled;

    const finalStatus = status !== undefined ? status : existing.status;
    if (!STATUSES.includes(finalStatus)) throw new AppError(400, "Statut invalide.");
    data.status = finalStatus;

    // Passage manuel à PUBLIE → horodatage + email (une seule fois).
    const justPublished = finalStatus === "PUBLIE" && existing.status !== "PUBLIE";
    if (justPublished) data.publishedAt = new Date();

    const prayer = await prisma.morningPrayer.update({
      where: { id: existing.id },
      data,
      include: prayerInclude,
    });

    if (justPublished) sendPrayerEmail(prayer);

    ok(res, prayer);
  })
);

// DELETE /api/prieres-matinales/:id — staff
router.delete(
  "/:id",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    await prisma.morningPrayer.delete({ where: { id: req.params.id } });
    ok(res, { id: req.params.id });
  })
);

export default router;
