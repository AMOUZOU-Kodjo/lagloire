import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { ok, AppError, asyncHandler } from "../lib/helpers.js";
import { userInclude, toUser } from "../lib/serialize.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

const ROLES = ["ADMIN", "APOTRE", "PASTEUR", "FIDELES", "VISITEUR"];
const GENDERS = ["HOMME", "FEMME"];
const MARITAL = ["CELIBATAIRE", "MARIE", "DIVORCE", "VEUF"];
const MINISTRIES = [
  "PASTEUR_TITULAIRE", "PASTEUR_ADJOINT", "APOTRE", "DIACRE", "DIACONESSE",
  "MAMAN_PASTEUR", "EVANGELISTE", "ENSEIGNANT", "RESPONSABLE_JEUNESSE",
  "RESPONSABLE_ADORATION", "AUCUN",
];
const normEnum = (value, allowed) => (value && allowed.includes(value) ? value : null);

// GET /api/users?search&role&page&limit
router.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "APOTRE", "PASTEUR"),
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const { search, role } = req.query;

    const where = {};
    if (search)
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: userInclude,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const pages = Math.max(1, Math.ceil(total / limit));
    ok(res, users.map(toUser), { page, limit, pages, total });
  })
);

// GET /api/users/:id
router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: userInclude,
    });
    if (!user) throw new AppError(404, "Utilisateur introuvable.");
    ok(res, toUser(user));
  })
);

// POST /api/users — création d'un membre par l'admin
router.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "APOTRE"),
  asyncHandler(async (req, res) => {
    const email = String(req.body.email ?? "").trim().toLowerCase();
    const { firstName, lastName } = req.body;
    if (!email || !firstName) throw new AppError(400, "Email et prénom requis.");

    const user = await prisma.user.create({
      data: {
        email,
        firstName: String(firstName).trim(),
        lastName: String(lastName ?? "").trim(),
        role: normEnum(req.body.role, ROLES) ?? "FIDELES",
        churchId: req.body.churchId || null,
        phone: req.body.phone || null,
      },
      include: userInclude,
    });
    ok(res, toUser(user));
  })
);

// PUT /api/users/:id — gestion admin (statut, rôle, église…)
router.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "APOTRE", "PASTEUR"),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        role: normEnum(req.body.role, ROLES) ?? undefined,
        isActive: req.body.isActive,
        churchId: req.body.churchId,
        phone: req.body.phone,
        ministry: normEnum(req.body.ministry, MINISTRIES) ?? undefined,
      },
      include: userInclude,
    });
    ok(res, toUser(user));
  })
);

// DELETE /api/users/:id
router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    await prisma.user.delete({ where: { id: req.params.id } });
    ok(res, { id: req.params.id });
  })
);

// PUT /api/users/profile/me — profil du compte connecté
router.put(
  "/profile/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    // Photo de profil : data URI (image redimensionnée côté navigateur) ou URL.
    let avatarUrl;
    if (typeof req.body.avatarUrl === "string") {
      avatarUrl = req.body.avatarUrl.trim() || null;
      if (avatarUrl && avatarUrl.length > 300_000)
        throw new AppError(400, "Image trop volumineuse — choisissez une photo plus légère.");
    }
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        phone: req.body.phone ?? undefined,
        ministry: normEnum(req.body.ministry, MINISTRIES) ?? undefined,
        profile: {
          upsert: {
            create: {
              city: req.body.city || null,
              bio: req.body.bio || null,
              gender: normEnum(req.body.gender, GENDERS),
              maritalStatus: normEnum(req.body.maritalStatus, MARITAL),
              avatarUrl: avatarUrl ?? null,
            },
            update: {
              city: req.body.city ?? undefined,
              bio: req.body.bio ?? undefined,
              gender: normEnum(req.body.gender, GENDERS) ?? undefined,
              maritalStatus: normEnum(req.body.maritalStatus, MARITAL) ?? undefined,
              ...(avatarUrl !== undefined ? { avatarUrl } : {}),
            },
          },
        },
      },
      include: userInclude,
    });
    ok(res, toUser(user));
  })
);

// DELETE /api/users/profile/avatar
router.delete(
  "/profile/avatar",
  requireAuth,
  asyncHandler(async (req, res) => {
    await prisma.profile.update({
      where: { userId: req.user.id },
      data: { avatarUrl: null },
    });
    ok(res, { avatarUrl: null });
  })
);

// PUT /api/users/password/me — définit ou modifie le mot de passe du compte connecté.
// Compte sans mot de passe (créé via OTP) : définition directe, sans mot de passe actuel.
router.put(
  "/password/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const currentPassword = req.body.currentPassword ? String(req.body.currentPassword) : "";
    const newPassword = String(req.body.newPassword ?? "");
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) throw new AppError(404, "Utilisateur introuvable.");
    if (newPassword.length < 6)
      throw new AppError(400, "Le nouveau mot de passe doit faire au moins 6 caractères.");
    if (
      user.password &&
      (!currentPassword || !bcrypt.compareSync(currentPassword, user.password))
    )
      throw new AppError(400, "Mot de passe actuel incorrect.");

    await prisma.user.update({
      where: { id: user.id },
      data: { password: bcrypt.hashSync(newPassword, 10) },
    });
    ok(res, { message: user.password ? "Mot de passe modifié." : "Mot de passe défini.", hasPassword: true });
  })
);

// GET /api/users/:id/visits — statistiques de visites d'un membre
router.get(
  "/:id/visits",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [views, visits, postReads] = await Promise.all([
      prisma.pageView.count({ where: { path: { contains: `/users/${req.params.id}` } } }),
      prisma.pageView.count({
        where: { path: { contains: `/users/${req.params.id}` }, date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
      prisma.postRead.count({ where: { userId: req.params.id } }),
    ]);
    ok(res, { totalViews: views, todayViews: visits, postReads });
  })
);

export default router;