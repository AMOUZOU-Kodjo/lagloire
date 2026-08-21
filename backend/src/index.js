import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { errorHandler, asyncHandler } from "./lib/helpers.js";
import { uploadBuffer } from "./services/cloudinary.service.js";
import { setIo } from "./lib/io.js";
import { verifyToken, requireAuth } from "./middleware/auth.js";

// ===================== Routes =====================
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import churchesRoutes from "./routes/churches.routes.js";
import eventsRoutes, { registrationsRouter } from "./routes/events.routes.js";
import programsRoutes from "./routes/programs.routes.js";
import postsRoutes from "./routes/posts.routes.js";
import prayersRoutes from "./routes/prayers.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import donationsRoutes from "./routes/donations.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import subscriptionsRoutes from "./routes/subscriptions.routes.js";
import liveRoutes from "./routes/live.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import { startScheduler } from "./services/scheduler.service.js";
import { startKeepAlive } from "./services/keepalive.service.js";

// ===================== App =====================
const app = express();
const server = http.createServer(app);
const PORT = Number(process.env.PORT) || 4000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, "..", "uploads"));
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Origines autorisées : FRONTEND_URL (production) + FRONTEND_URLS (supplémentaires, séparées par des virgules)
const allowedOrigins = [
  ...(process.env.FRONTEND_URL || "http://localhost:5173").split(","),
  ...(process.env.FRONTEND_URLS || "").split(","),
]
  .map((s) => s.trim())
  .filter(Boolean);
const corsOrigin = (origin, callback) =>
  callback(null, !origin || allowedOrigins.includes(origin));

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(UPLOAD_DIR));

// ===================== Socket.IO =====================
const io = new Server(server, {
  cors: { origin: corsOrigin, credentials: true },
});
setIo(io);

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentification requise."));
  try {
    const payload = verifyToken(token);
    socket.userId = payload.sub;
    next();
  } catch {
    next(new Error("Session invalide."));
  }
});

io.on("connection", (socket) => {
  socket.join(`user:${socket.userId}`);

  socket.on("chat:join", (roomId) => {
    if (typeof roomId === "string") socket.join(`chat:${roomId}`);
  });
  socket.on("chat:leave", (roomId) => {
    if (typeof roomId === "string") socket.leave(`chat:${roomId}`);
  });
  socket.on("chat:message", (payload) => {
    // Relais vers la salle (chat de conversation ou chat du direct)
    const room = payload?.conversationId || payload?.roomId;
    if (room) socket.to(`chat:${room}`).emit("chat:message", payload);
  });

  socket.on("disconnect", () => {
    socket.leave(`user:${socket.userId}`);
  });
});

// ===================== Upload =====================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/") ||
      file.mimetype.startsWith("audio/");
    cb(ok ? null : new Error("Seuls les fichiers image, vidéo et audio sont acceptés."), ok);
  },
});

// POST /api/upload — fichier (image/vidéo/audio) → { mediaUrl } (auth requis)
// Cloudinary si configuré, sinon repli disque local (/uploads).
app.post(
  "/api/upload",
  requireAuth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: "Fichier requis." });

    try {
      const uploaded = await uploadBuffer(req.file.buffer, {
        filename: req.file.originalname,
        resourceType: "auto",
        folder: "etdv",
      });
      if (uploaded) {
        return res.json({ success: true, data: { mediaUrl: uploaded.url } });
      }
    } catch (err) {
      console.error("[upload] Cloudinary :", err.message);
      // On continue vers le repli disque local.
    }

    const ext = path.extname(req.file.originalname || "").toLowerCase().slice(0, 10);
    const filename = `${crypto.randomBytes(16).toString("hex")}${ext}`;
    await fs.promises.writeFile(path.join(UPLOAD_DIR, filename), req.file.buffer);
    res.json({ success: true, data: { mediaUrl: `/uploads/${filename}` } });
  }),
  (err, _req, res, _next) => res.status(400).json({ success: false, message: err.message })
);

// ===================== Montage des routes =====================
// Sonde de santé pour les moniteurs d'uptime (Render, UptimeRobot, cron-job.org…)
app.get("/api/health", (_req, res) => res.json({ status: "ok", uptime: process.uptime() }));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/churches", churchesRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/registrations", registrationsRouter);
app.use("/api/programs", programsRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/prieres-matinales", prayersRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/donations", donationsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/subscriptions", subscriptionsRoutes);
app.use("/api/live", liveRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/stats", statsRoutes);

// 404 API
app.use("/api", (_req, res) =>
  res.status(404).json({ success: false, message: "Route introuvable." })
);

app.use(errorHandler);

// ===================== Démarrage =====================
server.listen(PORT, () => {
  console.log(`[ETDV API] démarrée sur http://localhost:${PORT}/api`);
  startScheduler();
  startKeepAlive();
});