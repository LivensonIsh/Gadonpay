import { Router } from "express";
import { z } from "zod";
import { merchantAuth, MerchantAuthedRequest } from "../../middleware/merchantAuth";
import { assertProjectOwnership } from "../projects/projects.service";
import { prisma } from "../../lib/prisma";

export const webhooksRouter = Router();
webhooksRouter.use(merchantAuth);

const createSchema = z.object({
  projectId: z.string().min(1),
  url: z.string().url(),
});

webhooksRouter.post("/", async (req: MerchantAuthedRequest, res, next) => {
  try {
    const input = createSchema.parse(req.body);
    await assertProjectOwnership(input.projectId, req.merchantId!);
    const webhook = await prisma.webhook.create({
      data: { projectId: input.projectId, url: input.url },
    });
    res.status(201).json({ ok: true, webhook });
  } catch (err) {
    next(err);
  }
});

webhooksRouter.get("/", async (req: MerchantAuthedRequest, res, next) => {
  try {
    const projectId = String(req.query.projectId ?? "");
    await assertProjectOwnership(projectId, req.merchantId!);
    const webhooks = await prisma.webhook.findMany({ where: { projectId } });
    res.json({ ok: true, webhooks });
  } catch (err) {
    next(err);
  }
});

webhooksRouter.patch("/:id/deactivate", async (req: MerchantAuthedRequest, res, next) => {
  try {
    const webhook = await prisma.webhook.findUnique({ where: { id: req.params.id } });
    if (!webhook) return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    await assertProjectOwnership(webhook.projectId, req.merchantId!);
    await prisma.webhook.update({ where: { id: webhook.id }, data: { active: false } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Liste des livraisons pour un paiement — utile pour le dashboard marchand (section 7.1)
webhooksRouter.get("/deliveries", async (req: MerchantAuthedRequest, res, next) => {
  try {
    const paymentId = String(req.query.paymentId ?? "");
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    await assertProjectOwnership(payment.projectId, req.merchantId!);
    const deliveries = await prisma.webhookDelivery.findMany({
      where: { paymentId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ ok: true, deliveries });
  } catch (err) {
    next(err);
  }
});
