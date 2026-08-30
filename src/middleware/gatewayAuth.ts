import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { sha256 } from "../utils/crypto";

export interface GatewayAuthedRequest extends Request {
  gatewayId?: string;
  projectId?: string;
}

/**
 * Authentifie une requête venant d'un Gateway (app Android ou Payment Node matériel).
 * Le token de Gateway est distinct de l'API_KEY marchand : un Gateway compromis
 * ne doit jamais permettre de créer des paiements arbitraires, uniquement de
 * pousser des SMS bruts pour matching (section 5.1 de la spec).
 */
export async function gatewayAuth(
  req: GatewayAuthedRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.header("X-Gateway-Token");
  if (!token) {
    return res.status(401).json({ ok: false, error: "GATEWAY_TOKEN_INVALID" });
  }

  const gateway = await prisma.gateway.findUnique({
    where: { tokenHash: sha256(token) },
  });

  if (!gateway) {
    return res.status(401).json({ ok: false, error: "GATEWAY_TOKEN_INVALID" });
  }

  req.gatewayId = gateway.id;
  req.projectId = gateway.projectId;

  // Heartbeat implicite à chaque requête d'ingestion (section 7.1/7.2 dashboards)
  await prisma.gateway.update({
    where: { id: gateway.id },
    data: { lastHeartbeatAt: new Date(), status: "ONLINE" },
  });

  next();
}
