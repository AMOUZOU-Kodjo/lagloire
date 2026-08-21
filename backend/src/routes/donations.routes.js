import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { ok, AppError, asyncHandler } from "../lib/helpers.js";
import { toUser, userInclude } from "../lib/serialize.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
const STAFF = ["ADMIN", "APOTRE", "PASTEUR"];

const donationInclude = {
  donor: { include: userInclude },
  church: true,
};

const DONATION_TYPES = ["OFFRANDE", "DIME", "PROJET"];
const PAYMENT_METHODS = ["FLOOZ", "TMONEY", "PAYPAL", "CARTE"];

// Forme attendue par le frontend : { paymentMethod, transactionId, amount, currency, type, status, church }
const toDonation = (d) => ({
  ...d,
  paymentMethod: d.method,
  transactionId: d.reference ?? `ETDV-${d.id.slice(0, 8).toUpperCase()}`,
  donor: d.donor ? toUser(d.donor) : null,
});

// POST /api/donations — don (public ou membre connecté)
// Payload DonPage : { amount, type, paymentMethod, phone, churchId }
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { type, amount, paymentMethod, method, phone, churchId, name, email, anonymous } = req.body;
    if (!type || !amount || amount <= 0)
      throw new AppError(400, "Type de don et montant valide requis.");

    const donation = await prisma.donation.create({
      data: {
        type: DONATION_TYPES.includes(type) ? type : "OFFRANDE",
        amount: Number(amount),
        method: PAYMENT_METHODS.includes(paymentMethod ?? method) ? (paymentMethod ?? method) : "FLOOZ",
        phone: phone || null,
        churchId: churchId || null,
        donorId: req.user?.id ?? null,
        name: name || null,
        email: email || null,
        anonymous: Boolean(anonymous),
      },
      include: donationInclude,
    });
    ok(res, toDonation(donation));
  })
);

// GET /api/donations/me — dons du membre connecté (avec église pour MesDonsPage)
router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const donations = await prisma.donation.findMany({
      where: { donorId: req.user.id },
      include: donationInclude,
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    ok(res, donations.map(toDonation));
  })
);

// GET /api/donations — staff : liste des dons
router.get(
  "/",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        include: donationInclude,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.donation.count(),
    ]);

    const pages = Math.max(1, Math.ceil(total / limit));
    ok(res, donations.map(toDonation), { page, limit, pages, total });
  })
);

// PUT /api/donations/:id/confirm — confirmation du paiement (staff)
router.put(
  "/:id/confirm",
  requireAuth,
  requireRole(...STAFF),
  asyncHandler(async (req, res) => {
    const donation = await prisma.donation.update({
      where: { id: req.params.id },
      data: { status: "CONFIRME" },
      include: donationInclude,
    });
    ok(res, toDonation(donation));
  })
);

export default router;