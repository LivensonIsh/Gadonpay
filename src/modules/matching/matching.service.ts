import { PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { dispatchWebhookEvent } from "../webhooks/webhook.service";
import { PAYMENT_ELIGIBLE_TYPES } from "../parsing/classifier.service";

const MATCHING_WINDOW_MS = env.MATCHING_TIME_WINDOW_MINUTES * 60 * 1000;

/**
 * Tente de faire correspondre une Transaction (SMS normalisé) fraîchement ingérée
 * à un Payment en attente. Règle v1 (section 8) :
 *   montant exact + même provider + même projet + fenêtre temporelle + jamais consommée.
 *
 * Appelé juste après l'ingestion d'un SMS (matching.attemptMatchForTransaction)
 * ET juste après la création d'un Payment (matching.attemptMatchForPayment),
 * pour couvrir les deux ordres d'arrivée possibles (le SMS peut arriver avant
 * ou après l'appel POST /v1/payments du marchand).
 */
export async function attemptMatchForTransaction(transactionId: string) {
  const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!transaction) return null;
  if (transaction.consumedAt) return null; // anti-rejeu : déjà consommée
  if (!PAYMENT_ELIGIBLE_TYPES.includes(transaction.type)) return null;
  if (transaction.amount === null) return null;

  const gateway = await prisma.gateway.findUnique({ where: { id: transaction.gatewayId } });
  if (!gateway) return null;

  const windowStart = new Date(
    (transaction.operatorTimestamp ?? transaction.createdAt).getTime() - MATCHING_WINDOW_MS
  );
  const windowEnd = new Date(
    (transaction.operatorTimestamp ?? transaction.createdAt).getTime() + MATCHING_WINDOW_MS
  );

  const candidate = await prisma.payment.findFirst({
    where: {
      projectId: gateway.projectId,
      provider: transaction.provider,
      amount: transaction.amount,
      status: PaymentStatus.PENDING,
      createdAt: { gte: windowStart, lte: windowEnd },
    },
    orderBy: { createdAt: "asc" }, // FIFO en cas de plusieurs commandes au même montant
  });

  if (!candidate) return null;

  return confirmMatch(candidate.id, transaction.id);
}

export async function attemptMatchForPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.status !== PaymentStatus.PENDING) return null;

  const windowStart = new Date(payment.createdAt.getTime() - MATCHING_WINDOW_MS);
  const windowEnd = new Date(payment.createdAt.getTime() + MATCHING_WINDOW_MS);

  const candidate = await prisma.transaction.findFirst({
    where: {
      provider: payment.provider,
      amount: payment.amount,
      consumedAt: null,
      type: { in: PAYMENT_ELIGIBLE_TYPES },
      gateway: { projectId: payment.projectId },
      OR: [
        { operatorTimestamp: { gte: windowStart, lte: windowEnd } },
        { operatorTimestamp: null, createdAt: { gte: windowStart, lte: windowEnd } },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  if (!candidate) return null;

  return confirmMatch(payment.id, candidate.id);
}

/**
 * Transaction atomique : marque la Transaction comme consommée (verrou anti-rejeu),
 * fait avancer le Payment dans le FSM, écrit le journal d'audit, déclenche le webhook.
 * Tout se passe dans une transaction DB pour éviter qu'une race condition ne laisse
 * une Transaction consommée deux fois (section 8).
 */
async function confirmMatch(paymentId: string, transactionId: string) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Row lock implicite via la contrainte UNIQUE(provider, transactionId) déjà en place ;
      // on revérifie ici que la transaction n'a pas été consommée entre-temps.
      const freshTransaction = await tx.transaction.findUniqueOrThrow({
        where: { id: transactionId },
      });
      if (freshTransaction.consumedAt) {
        throw new Error("DUPLICATE_TRANSACTION"); // déjà consommée par une requête concurrente
      }

      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: { consumedAt: new Date() },
      });

      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.PAID, matchedTransactionId: updatedTransaction.id },
      });

      await tx.logEntry.create({
        data: {
          projectId: updatedPayment.projectId,
          paymentId: updatedPayment.id,
          eventType: "PAYMENT_MATCHED_AND_PAID",
          details: JSON.stringify({
            transactionId: updatedTransaction.transactionId,
            amount: updatedTransaction.amount,
            provider: updatedTransaction.provider,
          }),
        },
      });

      return updatedPayment;
    });

    await dispatchWebhookEvent(result.id, "PAYMENT_SUCCEEDED");
    return result;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      // Contrainte UNIQUE violée → une requête concurrente a déjà consommé la transaction.
      return null;
    }
    if (err instanceof Error && err.message === "DUPLICATE_TRANSACTION") {
      return null;
    }
    throw err;
  }
}

/**
 * À exécuter périodiquement (cron/worker, voir src/jobs/expirePayments.job.ts) :
 * fait passer en EXPIRED tout Payment PENDING dont le délai de validité est dépassé.
 */
export async function expireStalePayments() {
  const now = new Date();
  const expired = await prisma.payment.findMany({
    where: { status: PaymentStatus.PENDING, expiresAt: { lt: now } },
  });

  for (const payment of expired) {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.EXPIRED },
      }),
      prisma.logEntry.create({
        data: {
          projectId: payment.projectId,
          paymentId: payment.id,
          eventType: "PAYMENT_EXPIRED",
          details: JSON.stringify({ reason: "no matching transaction before expiresAt" }),
        },
      }),
    ]);
    await dispatchWebhookEvent(payment.id, "PAYMENT_EXPIRED");
  }

  return expired.length;
}
