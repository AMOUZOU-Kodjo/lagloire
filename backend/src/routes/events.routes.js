import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { ok, AppError, asyncHandler } from "../lib/helpers.js";
import { toUser, userInclude } from "../lib/serialize.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { notifySubscribers, siteUrl } from "../services/email.service.js";

const router = Router();
const STAFF = ["ADMIN", "APOTRE", "PASTEUR"];

const eventInclude = {
  church: true,
  _count: { select: { registrations: true } },
};

// GET /api/events?type&page&limit&admin
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const isAdmin = req.query.admin === "true";
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

    const where = {};
    if (req.query.type) where.type = req.query.type;
    if (req.query.churchId) where.churchId = String(req.query.churchId);
    if (!isAdmin) where.status = { not: "ANNULE" };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: eventInclude,
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    const pages = Math.max(1, Math.ceil(total / limit));
    ok(res, events, { page, limit, pages, total });
  })
);

// GET /api/events/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: eventInclude,
    });
    if (!event) throw new AppError(404, "Événement introuvable.");
    ok(res, event);
  })
);

// POST /api/events — staff
router.post(
  "/",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const { title, description, type, date, startTime, endTime, location, maxCapacity, churchId } = req.body;
    if (!title || !date) throw new AppError(400, "Titre et date requis.");

    const event = await prisma.event.create({
      data: {
        title: String(title),
        description: description || null,
        type: type ?? "CULTE",
        date: new Date(date),
        startTime: startTime || null,
        endTime: endTime || null,
        location: location || null,
        maxCapacity: maxCapacity === "" || maxCapacity == null ? null : Number(maxCapacity),
        churchId: churchId || null,
      },
    });

    // Email aux abonnés (non bloquant)
    const dateFr = new Date(event.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    notifySubscribers({
      kicker: "Nouvel événement",
      title: event.title,
      message: `Un nouvel événement est programmé : ${dateFr}${event.location ? ` à ${event.location}` : ""}. ${event.description ?? ""}`.slice(0, 300),
      ctaLabel: "Voir l'événement",
      ctaUrl: `${siteUrl()}/evenements/${event.id}`,
    }).catch(() => {});

    ok(res, event);
  })
);

// PUT /api/events/:id — staff
router.put(
  "/:id",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const { title, description, type, date, startTime, endTime, location, maxCapacity, status, churchId } = req.body;
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        type,
        date: date ? new Date(date) : undefined,
        startTime,
        endTime,
        location,
        maxCapacity: maxCapacity === "" || maxCapacity == null ? null : Number(maxCapacity),
        status,
        churchId,
      },
      include: eventInclude,
    });
    ok(res, event);
  })
);

// DELETE /api/events/:id — staff
router.delete(
  "/:id",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    await prisma.event.delete({ where: { id: req.params.id } });
    ok(res, { id: req.params.id });
  })
);

// ============ Inscriptions ============

// POST /api/events/:id/register — membre connecté
router.post(
  "/:id/register",
  requireAuth,
  asyncHandler(async (req, res) => {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { registrations: true } } },
    });
    if (!event) throw new AppError(404, "Événement introuvable.");
    if (event.status === "TERMINE" || event.status === "ANNULE")
      throw new AppError(400, "Cet événement n'accepte plus d'inscriptions.");

    const existing = await prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId: event.id, userId: req.user.id } },
    });
    if (existing)
      throw new AppError(409, existing.status === "ANNULE" ? "Vous avez annulé votre inscription." : "Vous êtes déjà inscrit à cet événement.");

    if (event.maxCapacity && event._count.registrations >= event.maxCapacity)
      throw new AppError(400, "L'événement est complet.");

    const registration = await prisma.eventRegistration.create({
      data: { eventId: event.id, userId: req.user.id },
      include: { event: true },
    });
    ok(res, registration);
  })
);

// GET /api/events/:id/registrations — staff
router.get(
  "/:id/registrations",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const [rows, total] = await Promise.all([
      prisma.eventRegistration.findMany({
        where: { eventId: req.params.id },
        include: { user: { include: userInclude } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.eventRegistration.count({ where: { eventId: req.params.id } }),
    ]);
    const pages = Math.max(1, Math.ceil(total / limit));
    ok(res, rows.map((r) => ({ ...r, user: toUser(r.user) })), { page, limit, pages, total });
  })
);

// GET /api/registrations/me — mes inscriptions
const registrationsRouter = Router();

registrationsRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const registrations = await prisma.eventRegistration.findMany({
      where: { userId: req.user.id },
      include: { event: { select: { id: true, title: true, date: true, location: true, type: true } } },
      orderBy: { createdAt: "desc" },
    });
    ok(res, registrations);
  })
);

// PUT /api/registrations/:id/validate — staff
registrationsRouter.put(
  "/:id/validate",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const registration = await prisma.eventRegistration.update({
      where: { id: req.params.id },
      data: { status: "VALIDE", validatedAt: new Date() },
      include: { event: true, user: { include: userInclude } },
    });
    ok(res, { ...registration, user: toUser(registration.user) });
  })
);

// GET /api/registrations/:id/receipt — reçu d'inscription (propriétaire ou staff)
registrationsRouter.get(
  "/:id/receipt",
  requireAuth,
  asyncHandler(async (req, res) => {
    const registration = await prisma.eventRegistration.findUnique({
      where: { id: req.params.id },
      include: {
        event: { include: { church: true } },
        user: { include: userInclude },
      },
    });
    if (!registration) throw new AppError(404, "Inscription introuvable.");
    if (registration.userId !== req.user.id && !STAFF.includes(req.user.role))
      throw new AppError(403, "Accès refusé.");

    ok(res, {
      id: registration.id,
      status: registration.status,
      validatedAt: registration.validatedAt,
      createdAt: registration.createdAt,
      event: registration.event,
      attendee: toUser(registration.user),
      receiptNumber: `ETDV-${registration.id.slice(0, 8).toUpperCase()}`,
    });
  })
);

// DELETE /api/registrations/:id — annulation par le propriétaire
registrationsRouter.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const registration = await prisma.eventRegistration.findUnique({
      where: { id: req.params.id },
    });
    if (!registration) throw new AppError(404, "Inscription introuvable.");
    if (registration.userId !== req.user.id)
      throw new AppError(403, "Vous ne pouvez annuler que vos propres inscriptions.");

    const cancelled = await prisma.eventRegistration.update({
      where: { id: registration.id },
      data: { status: "ANNULE" },
    });
    ok(res, cancelled);
  })
);

export default router;
export { registrationsRouter };