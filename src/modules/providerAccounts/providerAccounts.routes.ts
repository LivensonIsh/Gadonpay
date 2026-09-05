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

function normalizePhone(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, "");
  return digits.startsWith("509") ? digits : `509${digits}`;
}

providerAccountsRouter.post("/", async (req: MerchantAuthedRequest, res, next) => {
  try {
    const input = createSchema.parse(req.body);
    await assertProjectOwnership(input.projectId, req.merchantId!);
    const account = await prisma.providerAccount.create({
      data: { projectId: input.projectId, provider: input.provider, phoneNumber: normalizePhone(input.phoneNumber) },
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

providerAccountsRouter.patch("/:id", async (req: MerchantAuthedRequest, res, next) => {
  try {
    const { phoneNumber } = z
      .object({ phoneNumber: z.string().regex(/^(509)?[0-9]{8}$/, "Numéro invalide") })
      .parse(req.body);
    const existing = await prisma.providerAccount.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    await assertProjectOwnership(existing.projectId, req.merchantId!);
    const account = await prisma.providerAccount.update({
      where: { id: req.params.id },
      data: { phoneNumber: normalizePhone(phoneNumber) },
    });
    res.json({ ok: true, account });
  } catch (err) {
    next(err);
  }
});

providerAccountsRouter.delete("/:id", async (req: MerchantAuthedRequest, res, next) => {
  try {
    const existing = await prisma.providerAccount.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    await assertProjectOwnership(existing.projectId, req.merchantId!);
    await prisma.providerAccount.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
