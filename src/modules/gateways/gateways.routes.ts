import { Router } from "express";
import { z } from "zod";
import { merchantAuth, MerchantAuthedRequest } from "../../middleware/merchantAuth";
import { gatewayAuth, GatewayAuthedRequest } from "../../middleware/gatewayAuth";
import { assertProjectOwnership } from "../projects/projects.service";
import { prisma } from "../../lib/prisma";
import { registerGateway, listGateways, ingestSms, regenerateGatewayToken } from "./gateways.service";

export const gatewaysRouter = Router();

const registerSchema = z.object({
  projectId: z.string().min(1),
  type: z.enum(["ANDROID", "HARDWARE"]),
});

gatewaysRouter.post("/", merchantAuth, async (req: MerchantAuthedRequest, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    await assertProjectOwnership(input.projectId, req.merchantId!);
    const gateway = await registerGateway(input.projectId, input.type);
    res.status(201).json({ ok: true, gateway, warning: "Copiez le token maintenant." });
  } catch (err) {
    next(err);
  }
});

gatewaysRouter.get("/", merchantAuth, async (req: MerchantAuthedRequest, res, next) => {
  try {
    const projectId = String(req.query.projectId ?? "");
    await assertProjectOwnership(projectId, req.merchantId!);
    const gateways = await listGateways(projectId);
    res.json({ ok: true, gateways });
  } catch (err) {
    next(err);
  }
});

gatewaysRouter.post("/:id/regenerate-token", merchantAuth, async (req: MerchantAuthedRequest, res, next) => {
  try {
    const gateway = await prisma.gateway.findUnique({ where: { id: req.params.id } });
    if (!gateway) return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    await assertProjectOwnership(gateway.projectId, req.merchantId!);
    const token = await regenerateGatewayToken(gateway.id);
    res.json({ ok: true, token, warning: "L'ancien token est révoqué. Reconfigurez votre app SMS-to-HTTP." });
  } catch (err) {
    next(err);
  }
});

const ingestSchema = z.object({
  provider: z.enum(["NATCASH", "MONCASH"]),
  rawText: z.string().min(1).max(2000),
  receivedAt: z.string().datetime().optional(),
});

gatewaysRouter.post("/ingest", gatewayAuth, async (req: GatewayAuthedRequest, res, next) => {
  try {
    const input = ingestSchema.parse(req.body);
    const transaction = await ingestSms({
      gatewayId: req.gatewayId!,
      provider: input.provider,
      rawText: input.rawText,
      receivedAt: input.receivedAt,
    });
    res.status(201).json({ ok: true, transaction: { id: transaction.id, type: transaction.type } });
  } catch (err) {
    next(err);
  }
});

gatewaysRouter.post("/heartbeat", gatewayAuth, async (_req: GatewayAuthedRequest, res) => {
  res.json({ ok: true });
});
