import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { ok, AppError, asyncHandler } from "../lib/helpers.js";
import { toPost } from "../lib/serialize.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { notifySubscribers, siteUrl } from "../services/email.service.js";

const router = Router();
const STAFF = ["ADMIN", "APOTRE", "PASTEUR"];

const postInclude = {
  author: { select: { firstName: true, lastName: true, role: true } },
  category: true,
  _count: { select: { reads: true } },
};

// GET /api/posts?page&limit — liste publique des actualités
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 12));

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        include: postInclude,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count(),
    ]);

    const pages = Math.max(1, Math.ceil(total / limit));
    ok(res, posts.map(toPost), { page, limit, pages, total });
  })
);

// GET /api/posts/categories — liste des catégories (doit être déclaré avant /:id)
router.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const categories = await prisma.postCategory.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true } } },
    });
    ok(res, categories);
  })
);

// POST /api/posts/categories — staff : créer une catégorie
router.post(
  "/categories",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const name = String(req.body?.name || "").trim();
    if (!name) throw new AppError(400, "Nom de catégorie requis.");
    const category = await prisma.postCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    ok(res, category);
  })
);

// GET /api/posts/:id — détail (avec contenu complet et compteur de lectures)
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: postInclude,
    });

    // Email aux abonnés (non bloquant)
    notifySubscribers({
      kicker: "Nouvelle actualité",
      title: post.title,
      message: post.excerpt || String(post.content).slice(0, 250),
      ctaLabel: "Lire l'article",
      ctaUrl: `${siteUrl()}/actualites/${post.id}`,
    }).catch(() => {});

    ok(res, toPost(post));
  })
);

// POST /api/posts — staff
router.post(
  "/",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const { title, excerpt, content, categoryId, publishedAt } = req.body;
    if (!title || !content) throw new AppError(400, "Titre et contenu requis.");

    const post = await prisma.post.create({
      data: {
        title: String(title),
        excerpt: excerpt || null,
        content: String(content),
        categoryId: categoryId || null,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        authorId: req.user.id,
      },
      include: postInclude,
    });
    ok(res, toPost(post));
  })
);

// PUT /api/posts/:id — staff
router.put(
  "/:id",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const { title, excerpt, content, categoryId, publishedAt } = req.body;
    const post = await prisma.post.update({
      where: { id: req.params.id },
      data: {
        title,
        excerpt,
        content,
        categoryId,
        publishedAt: publishedAt === null ? null : publishedAt ? new Date(publishedAt) : undefined,
      },
      include: postInclude,
    });
    ok(res, toPost(post));
  })
);

// DELETE /api/posts/:id — staff
router.delete(
  "/:id",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    await prisma.post.delete({ where: { id: req.params.id } });
    ok(res, { id: req.params.id });
  })
);

// POST /api/posts/:id/read — marquer une actualité comme lue
router.post(
  "/:id/read",
  requireAuth,
  asyncHandler(async (req, res) => {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) throw new AppError(404, "Actualité introuvable.");

    await prisma.postRead.upsert({
      where: { postId_userId: { postId: post.id, userId: req.user.id } },
      create: { postId: post.id, userId: req.user.id },
      update: {},
    });
    ok(res, { message: "Lecture enregistrée." });
  })
);

// GET /api/posts/:id/readers — staff : liste des lecteurs
router.get(
  "/:id/readers",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const reads = await prisma.postRead.findMany({
      where: { postId: req.params.id },
      include: { user: { include: { profile: true, church: true } } },
      orderBy: { readAt: "desc" },
    });
    ok(
      res,
      reads.map((r) => ({ id: r.id, readAt: r.readAt, user: { ...r.user, password: undefined } }))
    );
  })
);

export default router;