import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { ok, AppError, asyncHandler } from "../lib/helpers.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { notifySubscribers, siteUrl } from "../services/email.service.js";

const router = Router();
const STAFF = ["ADMIN", "APOTRE", "PASTEUR"];

const liveInclude = {
  author: { select: { firstName: true, lastName: true, role: true } },
};

// embedUrl calculé : YouTube → iframe embed ; INTERNE → aucun
const withEmbed = (stream) => ({
  ...stream,
  embedUrl:
    stream.type === "YOUTUBE" && stream.youtubeVideoId
      ? `https://www.youtube.com/embed/${stream.youtubeVideoId}`
      : stream.embedUrl || null,
});

// GET /api/live?status&limit
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const where = {};
    if (req.query.status) where.status = req.query.status;

    const streams = await prisma.liveStream.findMany({
      where,
      include: liveInclude,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    ok(res, streams.map(withEmbed));
  })
);

// GET /api/live/current — direct en cours (ou null)
router.get(
  "/current",
  asyncHandler(async (_req, res) => {
    const stream = await prisma.liveStream.findFirst({
      where: { status: "EN_DIRECT" },
      include: liveInclude,
      orderBy: { createdAt: "desc" },
    });
    ok(res, stream ? withEmbed(stream) : null);
  })
);

// GET /api/live/sync/youtube — staff : dernières vidéos YouTube
router.get(
  "/sync/youtube",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (_req, res) => {
    const recent = await prisma.liveStream.findMany({
      where: { type: "YOUTUBE", youtubeVideoId: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    ok(res, recent.map((r) => ({ videoId: r.youtubeVideoId, title: r.title, thumbnail: `https://i.ytimg.com/vi/${r.youtubeVideoId}/hqdefault.jpg` })));
  })
);

// GET /api/live/youtube/:videoId — infos d'une vidéo YouTube (oEmbed)
router.get(
  "/youtube/:videoId",
  asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    try {
      const oembed = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      ).then((r) => (r.ok ? r.json() : null));
      if (!oembed) throw new AppError(404, "Vidéo YouTube introuvable.");
      ok(res, { videoId, title: oembed.title, thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` });
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(404, "Vidéo YouTube introuvable.");
    }
  })
);

// GET /api/live/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const stream = await prisma.liveStream.findUnique({
      where: { id: req.params.id },
      include: liveInclude,
    });
    if (!stream) throw new AppError(404, "Direct introuvable.");
    ok(res, withEmbed(stream));
  })
);

// POST /api/live — staff : créer un direct
router.post(
  "/",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const { title, type, youtubeVideoId, streamUrl } = req.body;
    if (!title) throw new AppError(400, "Titre requis.");

    const stream = await prisma.liveStream.create({
      data: {
        title: String(title),
        type: type === "INTERNE" ? "INTERNE" : "YOUTUBE",
        youtubeVideoId: type === "YOUTUBE" ? youtubeVideoId || null : null,
        streamUrl: type === "INTERNE" ? streamUrl || null : null,
        authorId: req.user.id,
      },
      include: liveInclude,
    });
    ok(res, withEmbed(stream));

    // Email aux abonnés pour un nouveau direct programmé (non bloquant)
    notifySubscribers({
      kicker: "Direct programmé",
      title: stream.title,
      message: "Un direct a été programmé. Nous vous informerons dès le début de la diffusion.",
      ctaLabel: "Voir les directs",
      ctaUrl: `${siteUrl()}/direct`,
    }).catch(() => {});
  })
);

// PUT /api/live/:id — staff (statut, contenu…)
router.put(
  "/:id",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const existing = await prisma.liveStream.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, "Direct introuvable.");

    const { title, type, youtubeVideoId, streamUrl, status } = req.body;
    const data = {};
    if (title !== undefined) data.title = String(title);
    if (type !== undefined) {
      data.type = type === "INTERNE" ? "INTERNE" : "YOUTUBE";
      data.youtubeVideoId = data.type === "YOUTUBE" ? youtubeVideoId || null : null;
      data.streamUrl = data.type === "INTERNE" ? streamUrl || null : null;
    }
    if (status !== undefined) {
      data.status = status;
      if (status === "EN_DIRECT" && !existing.startedAt) data.startedAt = new Date();
      if (status === "TERMINE" && !existing.endedAt) data.endedAt = new Date();
    }

    const stream = await prisma.liveStream.update({
      where: { id: existing.id },
      data,
      include: liveInclude,
    });

    // Email aux abonnés au passage en direct (non bloquant, une seule fois)
    if (data.status === "EN_DIRECT" && existing.status !== "EN_DIRECT") {
      notifySubscribers({
        kicker: "Culte en direct",
        title: stream.title,
        message: "Le culte est en cours de diffusion en direct. Rejoignez-nous maintenant !",
        ctaLabel: "Rejoindre le direct",
        ctaUrl: `${siteUrl()}/direct`,
      }).catch(() => {});
    }

    ok(res, withEmbed(stream));
  })
);

// DELETE /api/live/:id — staff
router.delete(
  "/:id",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    await prisma.liveStream.delete({ where: { id: req.params.id } });
    ok(res, { id: req.params.id });
  })
);

export default router;