import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { sha256 } from "../utils/crypto";

export interface ApiKeyAuthedRequest extends Request {
  projectId?: string;
}

/**
 * Authentifie une requête d'intégration marchand via l'en-tête X-Gadonpay-Key.
 * Inspiré du contrat PAYNEX (X-Paynex-Key) mais avec vérification de statut
 * marchand (un compte suspendu ne peut plus créer de paiements).
 */
export async function apiKeyAuth(
  req: ApiKeyAuthedRequest,
  res: Response,
  next: NextFunction
) {
  const key = req.header("X-Gadonpay-Key");
  if (!key) {
    return res.status(401).json({ ok: false, error: "API_KEY_INVALID" });
  }

  const project = await prisma.project.findUnique({
    where: { apiKeyHash: sha256(key) },
    include: { merchant: true },
  });

  if (!project) {
    return res.status(401).json({ ok: false, error: "API_KEY_INVALID" });
  }

  if (project.merchant.status === "SUSPENDED") {
    return res.status(403).json({ ok: false, error: "USER_SUSPENDED" });
  }

  req.projectId = project.id;
  next();
}
