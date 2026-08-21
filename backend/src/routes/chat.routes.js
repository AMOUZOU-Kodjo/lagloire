import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { ok, AppError, asyncHandler } from "../lib/helpers.js";
import { toUser, userInclude } from "../lib/serialize.js";
import { requireAuth } from "../middleware/auth.js";
import { getIo } from "../lib/io.js";

const router = Router();

// Conversation avec participants (formes du frontend MessageriePage)
const conversationInclude = {
  participants: {
    include: { user: { include: userInclude } },
  },
  messages: {
    take: 50,
    orderBy: { createdAt: "desc" },
  },
};

const toConversation = (c) => ({
  ...c,
  participants: c.participants.map((p) => ({ userId: p.userId, user: toUser(p.user) })),
  // messages[0] = dernier message (ordre descendant) — attendu par ConversationList
});

// POST /api/chat { recipientId } — trouve ou crée une conversation privée
router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { recipientId } = req.body;
    if (!recipientId) throw new AppError(400, "Destinataire requis.");
    if (recipientId === req.user.id)
      throw new AppError(400, "Vous ne pouvez pas vous écrire à vous-même.");

    const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
    if (!recipient) throw new AppError(404, "Destinataire introuvable.");

    // Cherche une conversation existante entre les deux utilisateurs
    const mine = await prisma.conversationParticipant.findMany({
      where: { userId: req.user.id },
      select: { conversationId: true },
    });
    const conversations = await prisma.conversation.findMany({
      where: {
        id: { in: mine.map((m) => m.conversationId) },
        participants: { some: { userId: recipientId } },
      },
      include: conversationInclude,
    });

    let conversation = conversations[0];
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [
              { userId: req.user.id },
              { userId: recipientId },
            ],
          },
        },
        include: conversationInclude,
      });
    }
    ok(res, toConversation(conversation));
  })
);

// GET /api/chat — conversations du membre connecté (avec unreadCount)
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const mine = await prisma.conversationParticipant.findMany({
      where: { userId: req.user.id },
      select: { conversationId: true },
    });
    const ids = mine.map((m) => m.conversationId);

    const conversations = await prisma.conversation.findMany({
      where: { id: { in: ids } },
      include: conversationInclude,
      orderBy: { updatedAt: "desc" },
    });

    const unreadRows = await prisma.chatMessage.groupBy({
      by: ["conversationId"],
      where: { conversationId: { in: ids }, senderId: { not: req.user.id }, isRead: false },
      _count: true,
    });
    const unreadMap = Object.fromEntries(unreadRows.map((r) => [r.conversationId, r._count]));

    ok(
      res,
      conversations.map((c) => ({ ...toConversation(c), unreadCount: unreadMap[c.id] ?? 0 }))
    );
  })
);

// GET /api/chat/contacts — membres joignables (pour démarrer une discussion)
// NB : déclaré avant /:roomId pour éviter que "contacts" soit pris pour un identifiant.
router.get(
  "/contacts",
  requireAuth,
  asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
      where: { isActive: true, id: { not: req.user.id } },
      select: { id: true, firstName: true, lastName: true, role: true },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      take: 200,
    });
    ok(res, users);
  })
);

// GET /api/chat/:roomId?page&limit — historique (participants uniquement), ordre ascendant
router.get(
  "/:roomId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.roomId },
      include: { participants: { select: { userId: true } } },
    });
    if (!conversation) throw new AppError(404, "Conversation introuvable.");
    if (!conversation.participants.some((p) => p.userId === req.user.id))
      throw new AppError(403, "Accès refusé.");

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
    });
    ok(res, messages);
  })
);

// POST /api/chat/:roomId/messages { content, messageType } — envoi d'un message
router.post(
  "/:roomId/messages",
  requireAuth,
  asyncHandler(async (req, res) => {
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.roomId },
      include: { participants: { select: { userId: true } } },
    });
    if (!conversation) throw new AppError(404, "Conversation introuvable.");
    if (!conversation.participants.some((p) => p.userId === req.user.id))
      throw new AppError(403, "Accès refusé.");

    const content = String(req.body.content ?? "").trim();
    if (!content) throw new AppError(400, "Message vide.");

    const message = await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: req.user.id,
        content,
        messageType: req.body.messageType || "TEXTE",
      },
    });

    // Met à jour la conversation (tri côté frontend) et notifie les autres participants
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    const others = conversation.participants
      .filter((p) => p.userId !== req.user.id)
      .map((p) => p.userId);
    for (const userId of others) {
      await prisma.notification.create({
        data: {
          userId,
          type: "MESSAGE",
          title: "Nouveau message",
          message: content.slice(0, 120),
          link: "/messagerie",
        },
      });
      getIo()?.to(`user:${userId}`).emit("chat:message", {
        conversationId: conversation.id,
        message,
      });
    }

    ok(res, message);
  })
);

// PUT /api/chat/:roomId/read — marque les messages reçus comme lus
router.put(
  "/:roomId/read",
  requireAuth,
  asyncHandler(async (req, res) => {
    await prisma.chatMessage.updateMany({
      where: {
        conversationId: req.params.roomId,
        senderId: { not: req.user.id },
        isRead: false,
      },
      data: { isRead: true },
    });
    ok(res, { message: "Messages marqués comme lus." });
  })
);

// DELETE /api/chat/messages/:messageId — suppression (auteur uniquement)
router.delete(
  "/messages/:messageId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const message = await prisma.chatMessage.findFirst({
      where: { id: req.params.messageId, senderId: req.user.id },
    });
    if (!message) throw new AppError(404, "Message introuvable.");

    await prisma.chatMessage.delete({ where: { id: message.id } });
    ok(res, { id: message.id });
  })
);

export default router;