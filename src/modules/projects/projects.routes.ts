import { Router } from "express";
import { z } from "zod";
import { merchantAuth, MerchantAuthedRequest } from "../../middleware/merchantAuth";
import { createProject, listProjects } from "./projects.service";

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
      warning:
        "Copiez l'api_key et le webhook_secret maintenant : ils ne seront plus jamais affichés en clair.",
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
