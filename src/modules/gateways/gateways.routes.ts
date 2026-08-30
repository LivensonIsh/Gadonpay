import { Router } from "express";
import { z } from "zod";
import { merchantAuth, MerchantAuthedRequest } from "../../middleware/merchantAuth";
import { gatewayAuth, GatewayAuthedRequest } from "../../middleware/gatewayAuth";
import { assertProjectOwnership } from "../projects/projects.service";
import { registerGateway, listGateways, ingestSms } from "./gateways.service";

export const gatewaysRouter = Router();

// ── Gestion du Gateway côté dashboard marchand (JWT) ──────────────────────
const registerSchema = z.object({
  projectId: z.string().min(1),
  type: z.enum(["ANDROID", "HARDWARE"]),
});

gatewaysRouter.post("/", merchantAuth, async (req: MerchantAuthedRequest, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    await assertProjectOwnership(input.projectId, req.merchantId!);
    const gateway = await registerGateway(input.projectId, input.type);
    res.status(201).json({
      ok: true,
      gateway,
      warning: "Copiez le token maintenant : à saisir dans la config du composant SMS-to-HTTP.",
    });
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

// ── Ingestion des SMS bruts (auth par token Gateway, pas JWT marchand) ────
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
    // On ne renvoie jamais le contenu brut du SMS dans la réponse — seulement
    // ce qui est nécessaire pour que le Gateway confirme la réception.
    res.status(201).json({ ok: true, transaction: { id: transaction.id, type: transaction.type } });
  } catch (err) {
    next(err);
  }
});

// Heartbeat simple, utile même sans SMS à transmettre (statut "en ligne" du Gateway)
gatewaysRouter.post("/heartbeat", gatewayAuth, async (_req: GatewayAuthedRequest, res) => {
  res.json({ ok: true });
});
