import { GatewayType, Provider } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { logger } from "../../lib/logger";
import { generateSecretKey, sha256, encryptRawEvent } from "../../utils/crypto";
import { classifySms } from "../parsing/classifier.service";
import { parseSms } from "../parsing/parser.service";
import { attemptMatchForTransaction } from "../matching/matching.service";

export async function registerGateway(projectId: string, type: GatewayType) {
  const token = generateSecretKey("gwtok");

  const gateway = await prisma.gateway.create({
    data: { projectId, type, tokenHash: sha256(token) },
  });

  return {
    id: gateway.id,
    type: gateway.type,
    token, // affiché une seule fois, à saisir dans la config du composant SMS-to-HTTP tiers
    status: gateway.status,
  };
}

export async function listGateways(projectId: string) {
  return prisma.gateway.findMany({
    where: { projectId },
    select: { id: true, type: true, status: true, lastHeartbeatAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

interface IngestSmsInput {
  gatewayId: string;
  provider: Provider;
  rawText: string;
  receivedAt?: string;
}

/**
 * Point d'entrée unique pour tout SMS transmis par un Gateway (Android ou matériel).
 * Pipeline complet (section 5.2) : classification → extraction → normalisation
 * → chiffrement → stockage → tentative de matching immédiate.
 */
export async function ingestSms(input: IngestSmsInput) {
  const type = classifySms(input.rawText);
  const parsed = parseSms(input.provider, input.rawText);

  const finalType = type === "OTP" || parsed.type === "OTP" ? "OTP" : parsed.type;

  if (input.provider === Provider.MONCASH && finalType === "UNKNOWN") {
    // Le parser MonCash n'est pas encore calibré sur de vrais échantillons (section 5.2).
    // On ne bloque rien : la transaction est stockée en UNKNOWN, mais on log pour
    // pouvoir récupérer ces SMS bruts plus tard et affiner les regex.
    logger.warn(
      { gatewayId: input.gatewayId },
      "SMS MonCash non reconnu par le parser (format non calibré) — stocké en UNKNOWN pour analyse ultérieure"
    );
  }

  const rawEventEncrypted = encryptRawEvent(input.rawText);

  const transaction = await prisma.transaction.create({
    data: {
      gatewayId: input.gatewayId,
      provider: input.provider,
      transactionId: parsed.transactionId ?? `NO_CODE_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      type: finalType,
      amount: parsed.amount ?? undefined,
      fee: parsed.fee ?? undefined,
      sender: parsed.sender ?? undefined,
      senderPhone: parsed.senderPhone ?? undefined,
      balanceAfter: parsed.balanceAfter ?? undefined,
      operatorTimestamp: parsed.operatorTimestamp ?? undefined,
      rawEventEncrypted,
    },
  });

  if (finalType === "INCOMING_TRANSFER" || finalType === "DEPOSIT") {
    await attemptMatchForTransaction(transaction.id);
  }

  return transaction;
}

/** Révoque l'ancien token immédiatement — utile en cas de perte/compromission de l'appareil Gateway. */
export async function regenerateGatewayToken(gatewayId: string) {
  const token = generateSecretKey("gwtok");
  await prisma.gateway.update({
    where: { id: gatewayId },
    data: { tokenHash: sha256(token), status: "PENDING_ACTIVATION" },
  });
  return token;
}
