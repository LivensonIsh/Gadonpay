import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { adminAuth, AdminAuthedRequest } from "../../middleware/adminAuth";

export const adminRouter = Router();

// ── Login admin — table AdminUser distincte des Merchants (jamais confondues) ──
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

adminRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin) return res.status(401).json({ ok: false, error: "UNAUTHENTICATED" });

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return res.status(401).json({ ok: false, error: "UNAUTHENTICATED" });

    const token = jwt.sign(
      { sub: admin.id, type: "admin" },
      env.ADMIN_JWT_SECRET,
      { expiresIn: env.ADMIN_JWT_EXPIRES_IN } as jwt.SignOptions
    );
    res.json({ ok: true, token });
  } catch (err) {
    next(err);
  }
});

adminRouter.use(adminAuth);

async function logAdminAction(
  adminUserId: string,
  action: string,
  targetType: string,
  targetId: string,
  reason?: string
) {
  // Append-only, jamais modifié — section 7.2 : traçabilité de toute action admin
  await prisma.adminAuditLog.create({
    data: { adminUserId, action, targetType, targetId, reason },
  });
}

// ── Vue globale plateforme ────────────────────────────────────────────────
adminRouter.get("/overview", async (_req, res, next) => {
  try {
    const [merchantCount, paymentCount, paidCount, flaggedCount] = await Promise.all([
      prisma.merchant.count(),
      prisma.payment.count(),
      prisma.payment.count({ where: { status: "PAID" } }),
      prisma.payment.count({ where: { status: "FLAGGED" } }),
    ]);
    res.json({ ok: true, merchantCount, paymentCount, paidCount, flaggedCount });
  } catch (err) {
    next(err);
  }
});

// ── Gestion des marchands ─────────────────────────────────────────────────
adminRouter.get("/merchants", async (req, res, next) => {
  try {
    const search = String(req.query.search ?? "");
    const merchants = await prisma.merchant.findMany({
      where: search
        ? { OR: [{ email: { contains: search } }, { name: { contains: search } }] }
        : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        status: true,
        createdAt: true,
        _count: { select: { projects: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json({ ok: true, merchants });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch("/merchants/:id/suspend", async (req: AdminAuthedRequest, res, next) => {
  try {
    const { reason } = z.object({ reason: z.string().min(3) }).parse(req.body);
    const merchant = await prisma.merchant.update({
      where: { id: req.params.id },
      data: { status: "SUSPENDED" },
    });
    await logAdminAction(req.adminUserId!, "SUSPEND_MERCHANT", "Merchant", merchant.id, reason);
    res.json({ ok: true, merchant: { id: merchant.id, status: merchant.status } });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch("/merchants/:id/reactivate", async (req: AdminAuthedRequest, res, next) => {
  try {
    const merchant = await prisma.merchant.update({
      where: { id: req.params.id },
      data: { status: "ACTIVE" },
    });
    await logAdminAction(req.adminUserId!, "REACTIVATE_MERCHANT", "Merchant", merchant.id);
    res.json({ ok: true, merchant: { id: merchant.id, status: merchant.status } });
  } catch (err) {
    next(err);
  }
});

// ── Supervision des paiements et Gateways (transverse, tous marchands) ───
adminRouter.get("/payments", async (req, res, next) => {
  try {
    const status = req.query.status as string | undefined;
    const payments = await prisma.payment.findMany({
      where: status ? { status: status as any } : undefined,
      include: { project: { select: { name: true, merchant: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json({ ok: true, payments });
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/gateways", async (_req, res, next) => {
  try {
    const gateways = await prisma.gateway.findMany({
      include: { project: { select: { name: true, merchant: { select: { name: true } } } } },
      orderBy: { lastHeartbeatAt: "desc" },
    });
    // Signal de risque : Gateway silencieux depuis plus de 10 minutes (section 5.5)
    const now = Date.now();
    const withHealthFlag = gateways.map((g) => ({
      ...g,
      silent: !g.lastHeartbeatAt || now - g.lastHeartbeatAt.getTime() > 10 * 60 * 1000,
    }));
    res.json({ ok: true, gateways: withHealthFlag });
  } catch (err) {
    next(err);
  }
});

// Override manuel sur un paiement FLAGGED — toujours loggé (section 7.2 : jamais silencieux)
adminRouter.patch("/payments/:id/override", async (req: AdminAuthedRequest, res, next) => {
  try {
    const { reason } = z.object({ reason: z.string().min(3) }).parse(req.body);
    const payment = await prisma.payment.update({
      where: { id: req.params.id },
      data: { status: "PAID" },
    });
    await logAdminAction(req.adminUserId!, "OVERRIDE_PAYMENT_TO_PAID", "Payment", payment.id, reason);
    res.json({ ok: true, payment: { id: payment.id, status: payment.status } });
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/audit-logs", async (_req, res, next) => {
  try {
    const logs = await prisma.adminAuditLog.findMany({
      include: { adminUser: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    res.json({ ok: true, logs });
  } catch (err) {
    next(err);
  }
});
