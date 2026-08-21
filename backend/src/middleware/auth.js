import jwt from "jsonwebtoken";
import { AppError } from "../lib/helpers.js";

const SECRET = process.env.JWT_SECRET || "change-me-in-production";
const ACCESS_TTL = Number(process.env.ACCESS_TOKEN_TTL) || 900; // 15 min

/** Signe un access token JWT. */
export const signAccessToken = (user) =>
  jwt.sign(
    { sub: user.id, role: user.role },
    SECRET,
    { expiresIn: ACCESS_TTL }
  );

/** Signe le refresh token (30 j par défaut). */
export const signRefreshToken = (user) =>
  jwt.sign(
    { sub: user.id, type: "refresh" },
    SECRET,
    { expiresIn: Number(process.env.REFRESH_TOKEN_TTL) || 2592000 }
  );

/** Vérifie un token et renvoie son payload. */
export const verifyToken = (token) => jwt.verify(token, SECRET);

/** Cookie httpOnly du refresh token.
 *  Production : frontend et API sur des domaines distincts → SameSite=None + Secure
 *  (sinon le navigateur n'envoie jamais le cookie au rechargement). */
export const setRefreshCookie = (res, token) => {
  const production = process.env.NODE_ENV === "production";
  res.cookie("refreshToken", token, {
    httpOnly: true,
    sameSite: production ? "none" : "lax",
    secure: production || undefined,
    path: "/api/auth",
    maxAge: (Number(process.env.REFRESH_TOKEN_TTL) || 2592000) * 1000,
  });
};

export const clearRefreshCookie = (res) => {
  const production = process.env.NODE_ENV === "production";
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: production ? "none" : "lax",
    secure: production || undefined,
    path: "/api/auth",
  });
};

/** Extrait l'utilisateur depuis l'access token Bearer. */
const getUserFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
};

/** Middleware : requiert un utilisateur connecté. */
export const requireAuth = (req, _res, next) => {
  const payload = getUserFromRequest(req);
  if (!payload) return next(new AppError(401, "Authentification requise."));
  req.user = { id: payload.sub, role: payload.role };
  next();
};

/** Middleware : requiert l'un des rôles indiqués (ex. ["ADMIN", "APOTRE", "PASTEUR"]). */
export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new AppError(401, "Authentification requise."));
  if (!roles.includes(req.user.role))
    return next(new AppError(403, "Accès réservé aux responsables."));
  next();
};

/** Alias aligné sur la doc frontend : authorize("ADMIN","APOTRE") → staff. */
export const authorize = (...roles) => requireRole(...roles);