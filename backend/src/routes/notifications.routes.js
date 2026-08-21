import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { ok, AppError, asyncHandler } from "../lib/helpers.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Forme attendue par NotificationBell : { id, title, content, isRead, createdAt }
const toNotification = (n) => ({ ...n, content: n.message });

// GET /api/notifications?page&limit — notifications du membre connecté
// Enveloppe : { data: [...], unreadCount, pagination }
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where: { userId: req.user.id } }),
      prisma.notification.count({ where: { userId: req.user.id, isRead: false } }),
    ]);

    const pages = Math.max(1, Math.ceil(total / limit));
    ok(res, notifications.map(toNotification), { page, limit, pages, total }, { unreadCount });
  })
);

// PUT /api/notifications/:id/read
router.put(
  "/:id/read",
  requireAuth,
  asyncHandler(async (req, res) => {
    const notification = await prisma.notification.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!notification) throw new AppError(404, "Notification introuvable.");

    await prisma.notification.update({
      where: { id: notification.id },
      data: { isRead: true },
    });
    ok(res, { id: notification.id, isRead: true });
  })
);

// PUT /api/notifications/read-all
router.put(
  "/read-all",
  requireAuth,
  asyncHandler(async (req, res) => {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    ok(res, { message: "Notifications marquées comme lues." });
  })
);

// DELETE /api/notifications/:id
router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    await prisma.notification.deleteMany({
      where: { id: req.params.id, userId: req.user.id },
    });
    ok(res, { id: req.params.id });
  })
);

export default router;