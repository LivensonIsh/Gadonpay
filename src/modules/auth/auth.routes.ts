import { Router } from "express";
import { z } from "zod";
import { register, login } from "./auth.controller";
import { merchantAuth, MerchantAuthedRequest } from "../../middleware/merchantAuth";
import {
  sendEmailVerification,
  confirmEmailVerification,
  sendPhoneVerification,
  confirmPhoneVerification,
} from "./verification.service";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);

const codeSchema = z.object({ code: z.string().length(6) });

authRouter.post("/verify-email/send", merchantAuth, async (req: MerchantAuthedRequest, res, next) => {
  try {
    await sendEmailVerification(req.merchantId!);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/verify-email/confirm", merchantAuth, async (req: MerchantAuthedRequest, res, next) => {
  try {
    const { code } = codeSchema.parse(req.body);
    await confirmEmailVerification(req.merchantId!, code);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/verify-phone/send", merchantAuth, async (req: MerchantAuthedRequest, res, next) => {
  try {
    await sendPhoneVerification(req.merchantId!);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/verify-phone/confirm", merchantAuth, async (req: MerchantAuthedRequest, res, next) => {
  try {
    const { code } = codeSchema.parse(req.body);
    await confirmPhoneVerification(req.merchantId!, code);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
