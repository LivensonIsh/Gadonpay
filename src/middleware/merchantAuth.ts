import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface MerchantAuthedRequest extends Request {
  merchantId?: string;
}

export function merchantAuth(req: MerchantAuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, error: "UNAUTHENTICATED" });
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string; type: string };
    if (payload.type !== "merchant") {
      return res.status(401).json({ ok: false, error: "UNAUTHENTICATED" });
    }
    req.merchantId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ ok: false, error: "TOKEN_INVALID" });
  }
}
