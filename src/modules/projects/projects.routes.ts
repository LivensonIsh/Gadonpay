import { Router } from "express";
import { z } from "zod";
import { merchantAuth, MerchantAuthedRequest } from "../../middleware/merchantAuth";
import {
  createProject,
  listProjects,
  assertProjectOwnership,
  renameProject,
  regenerateApiKey,
  regenerateWebhookSecret,
} from "./projects.service";
import { listPayments } from "../payments/payments.service";
import { prisma } from "../../lib/prisma";

export const projectsRouter = Router();
projectsRouter.use(merchantAuth);

const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(120),
});

projectsRouter.post("/", async (req: MerchantAuthedRequest, res, next) => {
  try {
    const { name } = createProjectSchema.parse(req.body);
    const project = await createProject(req.merchantId!, name);
    res.status(201).json({
      ok: true,
      project,
      warning: "Copiez l'api_key et le webhook_secret maintenant : ils ne seront plus jamais affichés en clair.",
    });
  } catch (err) {
    next(err);
  }
});

projectsRouter.get("/", async (req: MerchantAuthedRequest, res, next) => {
  try {
    const projects = await listProjects(req.merchantId!);
    res.json({ ok: true, projects });
  } catch (err) {
    next(err);
  }
});

projectsRouter.get("/:id", async (req: MerchantAuthedRequest, res, next) => {
  try {
    const project = await assertProjectOwnership(req.params.id, req.merchantId!);
    res.json({
      ok: true,
      project: {
        id: project.id,
        name: project.name,
        apiKeyPrefix: project.apiKeyPrefix,
        createdAt: project.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

projectsRouter.patch("/:id", async (req: MerchantAuthedRequest, res, next) => {
  try {
    const { name } = z.object({ name: z.string().trim().min(2).max(120) }).parse(req.body);
    const project = await renameProject(req.params.id, req.merchantId!, name);
    res.json({ ok: true, project });
  } catch (err) {
    next(err);
  }
});

projectsRouter.post("/:id/regenerate-api-key", async (req: MerchantAuthedRequest, res, next) => {
  try {
    const apiKey = await regenerateApiKey(req.params.id, req.merchantId!);
    res.json({
      ok: true,
      apiKey,
      warning: "Copiez cette clé maintenant : elle ne sera plus jamais affichée. L'ancienne clé est déjà révoquée.",
    });
  } catch (err) {
    next(err);
  }
});

projectsRouter.post("/:id/regenerate-webhook-secret", async (req: MerchantAuthedRequest, res, next) => {
  try {
    const webhookSecret = await regenerateWebhookSecret(req.params.id, req.merchantId!);
    res.json({
      ok: true,
      webhookSecret,
      warning: "Copiez ce secret maintenant : il ne sera plus jamais affiché. L'ancien secret est déjà révoqué.",
    });
  } catch (err) {
    next(err);
  }
});

projectsRouter.get("/:id/payments", async (req: MerchantAuthedRequest, res, next) => {
  try {
    await assertProjectOwnership(req.params.id, req.merchantId!);
    const payments = await listPayments(req.params.id, {
      status: req.query.status as string | undefined,
      provider: req.query.provider as string | undefined,
    });
    res.json({ ok: true, payments });
  } catch (err) {
    next(err);
  }
});

projectsRouter.get("/:id/gateway-health", async (req: MerchantAuthedRequest, res, next) => {
  try {
    await assertProjectOwnership(req.params.id, req.merchantId!);
    const gateways = await prisma.gateway.findMany({ where: { projectId: req.params.id } });
    const now = Date.now();
    const withHealth = gateways.map((g) => ({
      id: g.id,
      type: g.type,
      status: g.status,
      silent: !g.lastHeartbeatAt || now - g.lastHeartbeatAt.getTime() > 10 * 60 * 1000,
    }));
    res.json({ ok: true, gateways: withHealth });
  } catch (err) {
    next(err);
  }
});
