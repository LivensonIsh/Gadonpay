import { Router } from "express";
import { z } from "zod";
import { merchantAuth, MerchantAuthedRequest } from "../../middleware/merchantAuth";
import { assertProjectOwnership } from "../projects/projects.service";
import { prisma } from "../../lib/prisma";

export const providerAccountsRouter = Router();
providerAccountsRouter.use(merchantAuth);

const createSchema = z.object({
  projectId: z.string().min(1),
  provider: z.enum(["NATCASH", "MONCASH"]),
  phoneNumber: z.string().regex(/^(509)?[0-9]{8}$/, "Numéro invalide"),
});

// Le numéro NatCash/MonCash qui reçoit réellement l'argent (jamais un compte
// détenu par GadonPay — voir positionnement, section 2 de la spec).
providerAccountsRouter.post("/", async (req: MerchantAuthedRequest, res, next) => {
  try {
    const input = createSchema.parse(req.body);
    await assertProjectOwnership(input.projectId, req.merchantId!);

    const digits = input.phoneNumber.replace(/\D/g, "");
    const normalized = digits.startsWith("509") ? digits : `509${digits}`;

    const account = await prisma.providerAccount.create({
      data: { projectId: input.projectId, provider: input.provider, phoneNumber: normalized },
    });

    res.status(201).json({ ok: true, account });
  } catch (err) {
    next(err);
  }
});

providerAccountsRouter.get("/", async (req: MerchantAuthedRequest, res, next) => {
  try {
    const projectId = String(req.query.projectId ?? "");
    await assertProjectOwnership(projectId, req.merchantId!);
    const accounts = await prisma.providerAccount.findMany({ where: { projectId } });
    res.json({ ok: true, accounts });
  } catch (err) {
    next(err);
  }
});
