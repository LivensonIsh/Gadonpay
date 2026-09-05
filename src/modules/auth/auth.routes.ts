import { Router } from "express";
import { z } from "zod";
import { register, login } from "./auth.controller";
import { merchantAuth, MerchantAuthedRequest } from "../../middleware/merchantAuth";
import { sendEmailVerification, confirmEmailVerification, sendPhoneVerification, confirmPhoneVerification } from "./verification.service";
import { requestPasswordReset, resetPassword } from "./passwordReset.service";
import { getProfile, updateProfile, changePassword } from "./profile.service";
import { DEPARTMENTS } from "./auth.schemas";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);

const codeSchema = z.object({ code: z.string().length(6) });

authRouter.post("/verify-email/send", merchantAuth, async (req: MerchantAuthedRequest, res, next) => {
  try { await sendEmailVerification(req.merchantId!); res.json({ ok: true }); } catch (err) { next(err); }
});
authRouter.post("/verify-email/confirm", merchantAuth, async (req: MerchantAuthedRequest, res, next) => {
  try { const { code } = codeSchema.parse(req.body); await confirmEmailVerification(req.merchantId!, code); res.json({ ok: true }); } catch (err) { next(err); }
});
authRouter.post("/verify-phone/send", merchantAuth, async (req: MerchantAuthedRequest, res, next) => {
  try { await sendPhoneVerification(req.merchantId!); res.json({ ok: true }); } catch (err) { next(err); }
});
authRouter.post("/verify-phone/confirm", merchantAuth, async (req: MerchantAuthedRequest, res, next) => {
  try { const { code } = codeSchema.parse(req.body); await confirmPhoneVerification(req.merchantId!, code); res.json({ ok: true }); } catch (err) { next(err); }
});

authRouter.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    await requestPasswordReset(email);
    res.json({ ok: true, message: "Si un compte existe avec cet email, un lien a été envoyé." });
  } catch (err) { next(err); }
});

authRouter.post("/reset-password", async (req, res, next) => {
  try {
    const { token, password } = z.object({ token: z.string().min(1), password: z.string().min(8) }).parse(req.body);
    await resetPassword(token, password);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

authRouter.get("/me", merchantAuth, async (req: MerchantAuthedRequest, res, next) => {
  try { const profile = await getProfile(req.merchantId!); res.json({ ok: true, merchant: profile }); } catch (err) { next(err); }
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  address: z.string().trim().min(4).max(255).optional(),
  department: z.enum(DEPARTMENTS).optional(),
  phoneNumber: z.string().trim().regex(/^(509)?[0-9]{8}$/).optional(),
});

authRouter.patch("/me", merchantAuth, async (req: MerchantAuthedRequest, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const profile = await updateProfile(req.merchantId!, data);
    res.json({ ok: true, merchant: profile });
  } catch (err) { next(err); }
});

authRouter.post("/change-password", merchantAuth, async (req: MerchantAuthedRequest, res, next) => {
  try {
    const { currentPassword, newPassword } = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8) }).parse(req.body);
    await changePassword(req.merchantId!, currentPassword, newPassword);
    res.json({ ok: true });
  } catch (err) { next(err); }
});
