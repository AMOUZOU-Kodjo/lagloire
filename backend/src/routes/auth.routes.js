import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { ok, fail, AppError, asyncHandler } from "../lib/helpers.js";
import { userInclude, toUser } from "../lib/serialize.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  setRefreshCookie,
  clearRefreshCookie,
  requireAuth,
} from "../middleware/auth.js";
import { generateCode, sendOtpEmail } from "../services/otp.service.js";

const router = Router();
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

const STAFF_ROLES = ["ADMIN", "APOTRE", "PASTEUR"];

// POST /api/auth/otp/send  { email }
router.post(
  "/otp/send",
  asyncHandler(async (req, res) => {
    const email = String(req.body.email ?? "").trim().toLowerCase();
    if (!email || !email.includes("@"))
      return fail(res, 400, "Adresse email invalide.");

    // Invalide les codes précédents non utilisés du même email
    await prisma.otpCode.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    const code = generateCode();
    await prisma.otpCode.create({
      data: { email, code, expiresAt: new Date(Date.now() + OTP_TTL_MS) },
    });
    await sendOtpEmail(email, code);

    ok(res, { message: "Code envoyé." });
  })
);

// POST /api/auth/otp/verify  { email, code, firstName?, lastName?, phone? }
router.post(
  "/otp/verify",
  asyncHandler(async (req, res) => {
    const email = String(req.body.email ?? "").trim().toLowerCase();
    const code = String(req.body.code ?? "").trim();

    if (!email || !code) return fail(res, 400, "Email et code requis.");

    const otp = await prisma.otpCode.findFirst({
      where: { email, code, used: false },
      orderBy: { createdAt: "desc" },
    });
    if (!otp) return fail(res, 400, "Code invalide, réessayez.");
    if (otp.expiresAt < new Date())
      return fail(res, 400, "Code expiré, demandez un nouveau code.");

    let user = await prisma.user.findUnique({ where: { email }, include: userInclude });

    if (!user) {
      // Premier accès : le prénom est requis pour créer le compte.
      // Le message contient "prénom" → le frontend affiche l'étape profil.
      const firstName = String(req.body.firstName ?? "").trim();
      if (!firstName)
        return fail(res, 400, "Votre prénom est requis pour créer votre compte.");

      user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName: String(req.body.lastName ?? "").trim(),
          phone: String(req.body.phone ?? "").trim() || null,
          role: "VISITEUR",
        },
        include: userInclude,
      });
    }

    if (!user.isActive)
      return fail(res, 403, "Ce compte a été désactivé, contactez l'administration.");

    await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });

    const accessToken = signAccessToken(user);
    setRefreshCookie(res, signRefreshToken(user));
    ok(res, { user: toUser(user), accessToken });
  })
);

// POST /api/auth/register — inscription classique (compte membre, rôle VISITEUR)
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const email = String(req.body.email ?? "").trim().toLowerCase();
    const firstName = String(req.body.firstName ?? "").trim();
    const lastName = String(req.body.lastName ?? "").trim();
    if (!email || !firstName)
      return fail(res, 400, "Email et prénom requis.");

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return fail(res, 409, "Un compte existe déjà avec cet email.");

    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        phone: String(req.body.phone ?? "").trim() || null,
        password: req.body.password ? bcrypt.hashSync(String(req.body.password), 10) : null,
        role: "VISITEUR",
      },
      include: userInclude,
    });

    const accessToken = signAccessToken(user);
    setRefreshCookie(res, signRefreshToken(user));
    ok(res, { user: toUser(user), accessToken });
  })
);

// POST /api/auth/login — connexion staff (email + mot de passe) du back-office
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const email = String(req.body.email ?? "").trim().toLowerCase();
    const password = String(req.body.password ?? "");

    const user = await prisma.user.findUnique({ where: { email }, include: userInclude });
    const valid =
      user &&
      user.password &&
      user.isActive &&
      STAFF_ROLES.includes(user.role) &&
      bcrypt.compareSync(password, user.password);

    if (!valid) return fail(res, 401, "Email ou mot de passe incorrect.");

    const accessToken = signAccessToken(user);
    setRefreshCookie(res, signRefreshToken(user));
    ok(res, { user: toUser(user), accessToken });
  })
);

// POST /api/auth/refresh — refresh silencieux via cookie httpOnly
router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token) return fail(res, 401, "Session expirée.");

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return fail(res, 401, "Session expirée.");
    }
    if (payload.type !== "refresh")
      return fail(res, 401, "Session expirée.");

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: userInclude,
    });
    if (!user || !user.isActive) return fail(res, 401, "Session expirée.");

    ok(res, { accessToken: signAccessToken(user) });
  })
);

// POST /api/auth/logout
router.post("/logout", (_req, res) => {
  clearRefreshCookie(res);
  ok(res, {});
});

// GET /api/auth/me — utilisateur courant
router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: userInclude,
    });
    if (!user) throw new AppError(404, "Utilisateur introuvable.");
    ok(res, toUser(user));
  })
);

export default router;