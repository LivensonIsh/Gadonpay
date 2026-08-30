import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AdminAuthedRequest extends Request {
  adminUserId?: string;
}

/** Authentification distincte du JWT marchand — secret différent, jamais interchangeable. */
export function adminAuth(req: AdminAuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, error: "UNAUTHENTICATED" });
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.ADMIN_JWT_SECRET) as { sub: string; type: string };
    if (payload.type !== "admin") {
      return res.status(401).json({ ok: false, error: "UNAUTHENTICATED" });
    }
    req.adminUserId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ ok: false, error: "TOKEN_INVALID" });
  }
}
