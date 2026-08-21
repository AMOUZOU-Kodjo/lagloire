// Helpers de réponse : enveloppe standard { success, data, pagination } + erreurs.
// Miroir du contrat http.js du frontend (unwrap → res.data, erreurs → res.data.message).

/** Réponse de succès : { success: true, data, pagination?, ...extra } */
export const ok = (res, data, pagination, extra) =>
  res.json({
    success: true,
    data,
    ...(pagination ? { pagination } : {}),
    ...(extra ?? {}),
  });

/** Pagination { page, pages, total } — forme attendue par le composant Pagination du frontend. */
export const makePagination = (page, limit, total) => ({
  page: Number(page),
  limit: Number(limit),
  pages: Math.max(1, Math.ceil(total / limit)),
  total,
});

/** Erreur applicative contrôlée. */
export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Réponse d'erreur : { success: false, message } */
export const fail = (res, status, message) =>
  res.status(status).json({ success: false, message });

/** Enveloppe un handler async pour propager les erreurs vers le middleware Express. */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/** Middleware d'erreur global. */
export const errorHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) return fail(res, err.status, err.message);
  if (err.code === "P2002") return fail(res, 409, "Cette valeur existe déjà.");
  console.error("ERREUR API:", err);
  return fail(res, 500, "Erreur interne du serveur.");
};