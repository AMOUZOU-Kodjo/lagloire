import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { ok, asyncHandler } from "../lib/helpers.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
const STAFF = ["ADMIN", "APOTRE", "PASTEUR"];

const startOfToday = () => new Date(new Date().setHours(0, 0, 0, 0));
const startOfMonth = () => new Date(new Date().setDate(1)).setHours(0, 0, 0, 0);

// GET /api/stats/dashboard — chiffres du tableau de bord admin
// Forme attendue : { users: {total, newThisMonth, byRole}, donations: {totalAmount, thisMonth, byMethod},
//   events: {upcoming, total}, traffic: {totalPageViews, today}, contacts: {unread},
//   subscriptions: {active}, live: {title} | null }
router.get(
  "/dashboard",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (_req, res) => {
    const now = new Date();
    const monthStart = new Date(startOfMonth());

    const [
      totalUsers,
      newThisMonth,
      byRole,
      donations,
      thisMonthDonations,
      upcomingEvents,
      totalEvents,
      totalPageViews,
      todayPageViews,
      unreadContacts,
      activeSubscriptions,
      live,
      pendingMedia,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.user.groupBy({ by: ["role"], _count: true }),
      prisma.donation.aggregate({ _sum: { amount: true } }),
      prisma.donation.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.event.findMany({
        where: { status: { not: "TERMINE" }, date: { gte: now } },
        include: { church: true, _count: { select: { registrations: true } } },
        orderBy: { date: "asc" },
        take: 5,
      }),
      prisma.event.count(),
      prisma.pageView.count(),
      prisma.pageView.count({ where: { date: { gte: startOfToday() } } }),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.subscription.count({ where: { active: true } }),
      prisma.liveStream.findFirst({ where: { status: "EN_DIRECT" }, select: { title: true } }),
      prisma.media.count({ where: { status: "EN_ATTENTE" } }),
    ]);

    const byMethodRows = await prisma.donation.groupBy({
      by: ["method"],
      _sum: { amount: true },
    });

    ok(res, {
      users: {
        total: totalUsers,
        newThisMonth,
        byRole: byRole.map((r) => ({ role: r.role, count: r._count })),
      },
      donations: {
        totalAmount: donations._sum.amount ?? 0,
        thisMonth: thisMonthDonations,
        byMethod: byMethodRows.map((r) => ({ method: r.method, total: r._sum.amount ?? 0 })),
      },
      events: { upcoming: upcomingEvents, total: totalEvents },
      traffic: { totalPageViews, today: todayPageViews },
      contacts: { unread: unreadContacts },
      subscriptions: { active: activeSubscriptions },
      live: live ? { title: live.title } : null,
      media: { pending: pendingMedia },
    });
  })
);

// GET /api/stats — chiffres globaux publics (sections "En chiffres")
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const [members, churches, upcomingEvents, donations, posts, totalEvents, subscribers] = await Promise.all([
      prisma.user.count({ where: { role: { in: ["ADMIN", "APOTRE", "PASTEUR", "FIDELES"] } } }),
      prisma.church.count(),
      prisma.event.count({ where: { date: { gte: new Date() } } }),
      prisma.donation.aggregate({ _sum: { amount: true } }),
      prisma.post.count(),
      prisma.event.count(),
      prisma.subscription.count({ where: { active: true } }),
    ]);
    ok(res, {
      members,
      churches,
      upcomingEvents,
      donations: donations._sum.amount ?? 0,
      posts,
      totalEvents,
      subscribers,
    });
  })
);

// GET /api/stats/churches/:id — détail d'une église (membres, événements à venir)
router.get(
  "/churches/:id",
  asyncHandler(async (req, res) => {
    const [church, members, upcomingEvents] = await Promise.all([
      prisma.church.findUnique({ where: { id: req.params.id } }),
      prisma.user.count({ where: { churchId: req.params.id, isActive: true } }),
      prisma.event.count({
        where: { churchId: req.params.id, date: { gte: new Date() } },
      }),
    ]);
    ok(res, { church, members, upcomingEvents });
  })
);

// POST /api/stats/track { path } — comptage de visite (analytics)
router.post(
  "/track",
  asyncHandler(async (req, res) => {
    const path = String(req.body.path ?? "/").slice(0, 200);
    await prisma.pageView.create({ data: { path, date: new Date() } });
    const [total, today] = await Promise.all([
      prisma.pageView.count(),
      prisma.pageView.count({ where: { date: { gte: startOfToday() } } }),
    ]);
    ok(res, { count: total, today });
  })
);

export default router;