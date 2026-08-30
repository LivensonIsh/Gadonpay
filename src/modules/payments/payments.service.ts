import { Prisma, Provider } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { attemptMatchForPayment } from "../matching/matching.service";
import { dispatchWebhookEvent } from "../webhooks/webhook.service";

export class PaymentError extends Error {
  constructor(message: string, public code: string, public statusCode = 400) {
    super(message);
  }
}

interface CreatePaymentInput {
  projectId: string;
  amount: number;
  currency?: string;
  provider: Provider;
  reference: string;
  idempotencyKey: string;
}

/**
 * Section 6.3/6.4 de la spec : création idempotente d'un paiement.
 * Règle stricte : Idempotency-Key + reference doivent être stables sur retry.
 * Ne JAMAIS créer un second paiement pour la même (projectId, idempotencyKey).
 */
export async function createPayment(input: CreatePaymentInput) {
  if (input.amount <= 0 || input.amount > 99_999_999) {
    throw new PaymentError("Montant invalide.", "AMOUNT_INVALID");
  }

  // Idempotence : si une requête identique a déjà créé ce paiement, on renvoie
  // le paiement existant tel quel plutôt que d'en créer un second (section 6.4).
  const existing = await prisma.payment.findUnique({
    where: {
      projectId_idempotencyKey: {
        projectId: input.projectId,
        idempotencyKey: input.idempotencyKey,
      },
    },
  });
  if (existing) return existing;

  const existingByReference = await prisma.payment.findUnique({
    where: { projectId_reference: { projectId: input.projectId, reference: input.reference } },
  });
  if (existingByReference) {
    // Même référence, clé d'idempotence différente : on refuse plutôt que de
    // créer un doublon métier — la référence marchand doit être unique par projet.
    throw new PaymentError("Cette référence existe déjà pour ce projet.", "REFERENCE_INVALID", 409);
  }

  const expiresAt = new Date(Date.now() + env.PAYMENT_EXPIRY_MINUTES * 60 * 1000);

  let payment;
  try {
    payment = await prisma.payment.create({
      data: {
        projectId: input.projectId,
        amount: input.amount,
        currency: input.currency ?? "HTG",
        provider: input.provider,
        reference: input.reference,
        idempotencyKey: input.idempotencyKey,
        expiresAt,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      // Race condition sur idempotency-key entre deux requêtes concurrentes identiques.
      const raced = await prisma.payment.findUnique({
        where: {
          projectId_idempotencyKey: {
            projectId: input.projectId,
            idempotencyKey: input.idempotencyKey,
          },
        },
      });
      if (raced) return raced;
    }
    throw err;
  }

  await prisma.logEntry.create({
    data: {
      projectId: payment.projectId,
      paymentId: payment.id,
      eventType: "PAYMENT_CREATED",
      details: JSON.stringify({ amount: payment.amount, provider: payment.provider }),
    },
  });
  await dispatchWebhookEvent(payment.id, "PAYMENT_CREATED");

  // Le SMS a pu arriver avant l'appel API (l'utilisateur paie puis intègre) :
  // on tente un matching immédiat contre les transactions déjà en attente.
  const matched = await attemptMatchForPayment(payment.id);

  return matched ?? payment;
}

export async function getPayment(projectId: string, paymentId: string) {
  const payment = await prisma.payment.findFirst({ where: { id: paymentId, projectId } });
  if (!payment) {
    throw new PaymentError("Paiement introuvable.", "NOT_FOUND", 404);
  }
  return payment;
}

export async function listPayments(
  projectId: string,
  filters: { status?: string; provider?: string }
) {
  return prisma.payment.findMany({
    where: {
      projectId,
      status: filters.status as any,
      provider: filters.provider as any,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
