import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../lib/logger";
import { AuthError } from "../modules/auth/auth.service";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      ok: false,
      error: "VALIDATION_ERROR",
      details: err.flatten().fieldErrors,
    });
  }

  if (err instanceof AuthError) {
    return res.status(err.statusCode).json({ ok: false, error: err.message });
  }

  logger.error({ err }, "Erreur interne non gérée");
  return res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
}
