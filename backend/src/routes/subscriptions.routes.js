import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { ok, fail, asyncHandler } from "../lib/helpers.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
const STAFF = ["ADMIN", "APOTRE", "PASTEUR"];

// POST /api/subscriptions — inscription à la newsletter
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const email = String(req.body.email ?? "").trim().toLowerCase();
    if (!email || !email.includes("@"))
      return fail(res, 400, "Adresse email invalide.");

    const existing = await prisma.subscription.findUnique({ where: { email } });
    let subscription;
    if (existing) {
      subscription = await prisma.subscription.update({
        where: { email },
        data: { active: true, name: req.body.name || existing.name },
      });
    } else {
      subscription = await prisma.subscription.create({
        data: { email, name: req.body.name || null },
      });
    }
    ok(res, subscription);
  })
);

// POST /api/subscriptions/unsubscribe
router.post(
  "/unsubscribe",
  asyncHandler(async (req, res) => {
    const email = String(req.body.email ?? "").trim().toLowerCase();
    const existing = await prisma.subscription.findUnique({ where: { email } });
    if (existing) {
      await prisma.subscription.update({ where: { email }, data: { active: false } });
    }
    ok(res, { message: "Désabonnement effectué." });
  })
);

// PATCH /api/subscriptions/:id — staff : activer / désactiver un abonné
router.patch(
  "/:id",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const id = String(req.params.id ?? "").trim();
    if (!id) return fail(res, 400, "Identifiant invalide.");
    const existing = await prisma.subscription.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, "Abonné introuvable.");
    const subscription = await prisma.subscription.update({
      where: { id },
      data: { active: Boolean(req.body.active) },
    });
    ok(res, subscription);
  })
);


// GET /api/subscriptions — staff
router.get(
  "/",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.subscription.count(),
    ]);

    const pages = Math.max(1, Math.ceil(total / limit));
    ok(res, subscriptions, { page, limit, pages, total });
  })
);

export default router;