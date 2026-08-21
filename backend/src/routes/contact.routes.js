import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { ok, AppError, asyncHandler } from "../lib/helpers.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { notifyStaffContact } from "../services/email.service.js";

const router = Router();
const STAFF = ["ADMIN", "APOTRE", "PASTEUR"];

// POST /api/contact — message public (formulaire de contact)
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, email, subject, message, recipientType, recipientId } = req.body;
    if (!name || !email || !message)
      throw new AppError(400, "Nom, email et message requis.");

    const contact = await prisma.contactMessage.create({
      data: {
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        subject: String(subject ?? "").trim() || null,
        message: String(message),
        recipientType: String(recipientType || "EGLISE"),
        recipientId: recipientId || null,
      },
    });

    // Transfert par email à l'équipe (non bloquant)
    notifyStaffContact({ name: contact.name, email: contact.email, subject: contact.subject, message: contact.message })
      .catch(() => {});

    ok(res, contact);
  })
);

// GET /api/contact — staff : boîte de réception
router.get(
  "/",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contactMessage.count(),
    ]);

    const pages = Math.max(1, Math.ceil(total / limit));
    ok(res, messages, { page, limit, pages, total });
  })
);

// PUT /api/contact/:id/read — marquer comme lu (staff)
router.put(
  "/:id/read",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const message = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { isRead: true, readAt: new Date() },
    });
    ok(res, message);
  })
);

// DELETE /api/contact/:id — staff
router.delete(
  "/:id",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    await prisma.contactMessage.delete({ where: { id: req.params.id } });
    ok(res, { id: req.params.id });
  })
);

export default router;