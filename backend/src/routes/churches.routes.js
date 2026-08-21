import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { ok, AppError, asyncHandler } from "../lib/helpers.js";
import { toUser, userInclude } from "../lib/serialize.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

const withCount = {
  include: { _count: { select: { users: true } } },
};

// GET /api/churches — liste publique (avec compteur de membres _count.members)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const churches = await prisma.church.findMany({
      ...withCount,
      orderBy: { name: "asc" },
    });
    ok(res, churches.map((c) => ({ ...c, _count: { members: c._count.users } })));
  })
);

// ============ Annuaire (authentification requise) ============
// GET /api/churches/directory/leadership|members|visitors
//   params : churchId?, ministry?, page?, limit?
//   → { data: [membre], pagination } — forme attendue par l'AnnuairePage.
//   ⚠ Déclaré AVANT /:id pour ne pas être capté par le paramètre dynamique.

const DIRECTORY_ROLE = {
  leadership: { in: ["ADMIN", "APOTRE", "PASTEUR"] },
  members: "FIDELES",
  visitors: "VISITEUR",
};

const DIRECTORY_LABEL = {
  leadership: "Responsables",
  members: "Fidèles",
  visitors: "Visiteurs",
};

router.get(
  "/directory/:tab",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { tab } = req.params;
    if (!DIRECTORY_ROLE[tab])
      throw new AppError(400, `Annuaire inconnu (${tab}).`);

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const { churchId, ministry } = req.query;

    const where = { isActive: true };
    if (DIRECTORY_ROLE[tab].in) where.role = { in: DIRECTORY_ROLE[tab].in };
    else where.role = DIRECTORY_ROLE[tab];
    if (churchId) where.churchId = String(churchId);
    if (ministry && ministry !== "AUCUN") where.ministry = String(ministry);

    const [members, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: userInclude,
        orderBy: [{ role: "asc" }, { firstName: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const pages = Math.max(1, Math.ceil(total / limit));
    ok(res, members.map(toUser), { page, limit, pages, total, label: DIRECTORY_LABEL[tab] });
  })
);

// GET /api/churches/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const church = await prisma.church.findUnique({
      where: { id: req.params.id },
      ...withCount,
    });
    if (!church) throw new AppError(404, "Église introuvable.");
    ok(res, { ...church, _count: { members: church._count.users } });
  })
);

// POST /api/churches — staff
router.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "APOTRE", "PASTEUR"),
  asyncHandler(async (req, res) => {
    const { name, city, country, address, phone, email, description, imageUrl } = req.body;
    if (!name || !city) throw new AppError(400, "Nom et ville requis.");

    const church = await prisma.church.create({
      data: {
        name: String(name),
        city: String(city),
        country: String(country || "Togo"),
        address: address || null,
        phone: phone || null,
        email: email || null,
        description: description || null,
        imageUrl: imageUrl || null,
      },
    });
    ok(res, church);
  })
);

// PUT /api/churches/:id — staff
router.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "APOTRE", "PASTEUR"),
  asyncHandler(async (req, res) => {
    const { name, city, country, address, phone, email, description, imageUrl } = req.body;
    const church = await prisma.church.update({
      where: { id: req.params.id },
      data: {
        name,
        city,
        country,
        address,
        phone,
        email,
        description,
        imageUrl: imageUrl || null,
      },
    });
    ok(res, church);
  })
);

// DELETE /api/churches/:id — staff
router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "APOTRE", "PASTEUR"),
  asyncHandler(async (req, res) => {
    await prisma.church.delete({ where: { id: req.params.id } });
    ok(res, { id: req.params.id });
  })
);

export default router;