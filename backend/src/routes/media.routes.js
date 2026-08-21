import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { ok, AppError, asyncHandler } from "../lib/helpers.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
const MANAGE = ["ADMIN", "APOTRE"];

const mediaInclude = {
  author: { select: { firstName: true, lastName: true, role: true } },
};

// GET /api/media?type&page&limit — galerie publique (approuvés + visibles)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30));

    const where = { status: "APPROUVE", visible: true };
    if (req.query.type) where.type = req.query.type;

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        include: mediaInclude,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.media.count({ where }),
    ]);

    const pages = Math.max(1, Math.ceil(total / limit));
    ok(res, media, { page, limit, pages, total });
  })
);

// GET /api/media/pending — modération (ADMIN/APOTRE)
router.get(
  "/pending",
  requireAuth,
  requireRole(...MANAGE),
  asyncHandler(async (_req, res) => {
    const media = await prisma.media.findMany({
      where: { status: "EN_ATTENTE" },
      include: mediaInclude,
      orderBy: { createdAt: "desc" },
    });
    ok(res, media);
  })
);

// GET /api/media/manage — tous les médias pour le back-office (ADMIN/APOTRE)
router.get(
  "/manage",
  requireAuth,
  requireRole(...MANAGE),
  asyncHandler(async (req, res) => {
    const where = {};
    if (req.query.status) where.status = req.query.status;

    const media = await prisma.media.findMany({
      where,
      include: mediaInclude,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    ok(res, media);
  })
);

// GET /api/media/mine — soumissions de l'utilisateur connecté (tous statuts)
router.get(
  "/mine",
  requireAuth,
  asyncHandler(async (req, res) => {
    const media = await prisma.media.findMany({
      where: { authorId: req.user.id },
      include: mediaInclude,
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    ok(res, media);
  })
);

// GET /api/media/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const media = await prisma.media.findUnique({
      where: { id: req.params.id },
      include: mediaInclude,
    });
    if (!media) throw new AppError(404, "Média introuvable.");
    if (media.status !== "APPROUVE" || !media.visible)
      throw new AppError(404, "Média introuvable.");
    ok(res, media);
  })
);

// POST /api/media — soumission (membre connecté) → statut EN_ATTENTE
router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { title, type, url, thumbnailUrl, description } = req.body;
    if (!title || !type || !url)
      throw new AppError(400, "Titre, type et URL requis.");

    const isStaff = ["ADMIN", "APOTRE"].includes(req.user.role);

    const media = await prisma.media.create({
      data: {
        title: String(title),
        type: String(type),
        url: String(url),
        thumbnailUrl: thumbnailUrl || null,
        description: description || null,
        status: isStaff ? "APPROUVE" : "EN_ATTENTE",
        authorId: req.user.id,
      },
      include: mediaInclude,
    });
    ok(res, media);
  })
);

// PUT /api/media/approve/:id — validation par l'équipe dirigeante
router.put(
  "/approve/:id",
  requireAuth,
  requireRole(...MANAGE),
  asyncHandler(async (req, res) => {
    const media = await prisma.media.update({
      where: { id: req.params.id },
      data: { status: "APPROUVE" },
      include: mediaInclude,
    });
    ok(res, media);
  })
);

// PUT /api/media/:id — modification (propriétaire ou staff)
router.put(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const existing = await prisma.media.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, "Média introuvable.");
    if (existing.authorId !== req.user.id && !MANAGE.includes(req.user.role))
      throw new AppError(403, "Vous ne pouvez modifier que vos propres médias.");

    const media = await prisma.media.update({
      where: { id: existing.id },
      data: {
        title: req.body.title,
        type: req.body.type,
        url: req.body.url,
        thumbnailUrl: req.body.thumbnailUrl ?? undefined,
        description: req.body.description,
        visible: req.body.visible,
      },
      include: mediaInclude,
    });
    ok(res, media);
  })
);

// PATCH /api/media/:id/visibility — afficher / masquer (staff, toggle si aucun body)
router.patch(
  "/:id/visibility",
  requireAuth,
  requireRole(...MANAGE),
  asyncHandler(async (req, res) => {
    const existing = await prisma.media.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, "Média introuvable.");

    const media = await prisma.media.update({
      where: { id: existing.id },
      data: { visible: req.body.visible === undefined ? !existing.visible : Boolean(req.body.visible) },
    });
    ok(res, media);
  })
);

// DELETE /api/media/:id — propriétaire ou staff
router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const existing = await prisma.media.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, "Média introuvable.");
    if (existing.authorId !== req.user.id && !MANAGE.includes(req.user.role))
      throw new AppError(403, "Vous ne pouvez supprimer que vos propres médias.");

    await prisma.media.delete({ where: { id: existing.id } });
    ok(res, { id: existing.id });
  })
);

export default router;