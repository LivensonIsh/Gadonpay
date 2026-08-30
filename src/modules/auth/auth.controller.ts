import { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "./auth.schemas";
import { registerMerchant, loginMerchant } from "./auth.service";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body);
    const merchant = await registerMerchant(input);
    res.status(201).json({ ok: true, merchant });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await loginMerchant(input);
    res.status(200).json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
}
