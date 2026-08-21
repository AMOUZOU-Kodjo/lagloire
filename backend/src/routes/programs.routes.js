import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { ok, AppError, asyncHandler } from "../lib/helpers.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
const STAFF = ["ADMIN", "APOTRE", "PASTEUR"];

// GET /api/programs?type&page&limit&admin
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));

    const where = {};
    if (req.query.type) where.type = req.query.type;

    const [programs, total] = await Promise.all([
      prisma.program.findMany({
        where,
        include: { church: true },
        orderBy: { startDate: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.program.count({ where }),
    ]);

    const pages = Math.max(1, Math.ceil(total / limit));
    ok(res, programs, { page, limit, pages, total });
  })
);

// GET /api/programs/daily-verse — prière du jour (dernière prière matinale publiée)
router.get(
  "/daily-verse",
  asyncHandler(async (req, res) => {
    const prayer = await prisma.morningPrayer.findFirst({
      orderBy: { createdAt: "desc" },
      include: { author: { select: { firstName: true, lastName: true, role: true } } },
    });
    if (!prayer) throw new AppError(404, "Aucune prière publiée pour le moment.");
    ok(res, {
      id: prayer.id,
      title: prayer.title,
      content: prayer.content,
      bibleVerse: prayer.bibleVerse,
      author: prayer.author,
    });
  })
);

// GET /api/programs/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const program = await prisma.program.findUnique({
      where: { id: req.params.id },
      include: { church: true },
    });
    if (!program) throw new AppError(404, "Programme introuvable.");
    ok(res, program);
  })
);

// POST /api/programs — staff
router.post(
  "/",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const { title, description, type, startDate, endDate, location, churchId, dayOfWeek, startTime, endTime } = req.body;
    if (!title || !startDate) throw new AppError(400, "Titre et date de début requis.");

    const program = await prisma.program.create({
      data: {
        title: String(title),
        description: description || null,
        type: type ?? "HEBDOMADAIRE",
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        location: location || null,
        churchId: churchId || null,
        dayOfWeek: Number.isInteger(Number(dayOfWeek)) && dayOfWeek !== "" ? Number(dayOfWeek) : null,
        startTime: startTime || null,
        endTime: endTime || null,
      },
    });
    ok(res, program);
  })
);

// PUT /api/programs/:id — staff
router.put(
  "/:id",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const { title, description, type, startDate, endDate, location, churchId, dayOfWeek, startTime, endTime } = req.body;
    const program = await prisma.program.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        type,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : null,
        location,
        churchId,
        dayOfWeek: dayOfWeek === "" || dayOfWeek === null || dayOfWeek === undefined
          ? null
          : Number.isInteger(Number(dayOfWeek)) ? Number(dayOfWeek) : undefined,
        startTime: startTime ?? null,
        endTime: endTime ?? null,
      },
    });
    ok(res, program);
  })
);

// DELETE /api/programs/:id — staff
router.delete(
  "/:id",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    await prisma.program.delete({ where: { id: req.params.id } });
    ok(res, { id: req.params.id });
  })
);

export default router;