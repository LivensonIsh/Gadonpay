import { WebhookDeliveryStatus, WebhookEventType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { logger } from "../../lib/logger";
import { env } from "../../config/env";
import { signWebhookPayload, decryptRawEvent } from "../../utils/crypto";

/**
 * NOTE IMPORTANTE (héritée de PAYNEX et renforcée, section 6.5 de la spec) :
 * ce service ne doit JAMAIS être le seul juge de la vérité. Le marchand doit
 * toujours pouvoir re-vérifier côté serveur via GET /v1/payments/:id avant de
 * livrer quoi que ce soit. Un webhook peut se perdre ; l'état en base ne ment pas.
 *
 * Le WEBHOOK_SECRET est stocké chiffré (Project.webhookSecretEncrypted, AES-256-GCM
 * via utils/crypto.ts) — jamais en clair en base, mais récupérable pour signer un
 * envoi sortant. C'est différent de l'API_KEY, qui elle est uniquement hashée
 * (jamais besoin de la relire, seulement de la comparer).
 */

async function buildPayload(paymentId: string, eventType: WebhookEventType) {
  const payment = await prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });
  return {
    event: eventType,
    data: {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      provider: payment.provider,
      reference: payment.reference,
      created_at: payment.createdAt,
    },
  };
}

export async function dispatchWebhookEvent(paymentId: string, eventType: WebhookEventType) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { project: { include: { webhooks: { where: { active: true } } } } },
  });
  if (!payment) return;

  const payloadObj = await buildPayload(paymentId, eventType);
  const payloadStr = JSON.stringify(payloadObj);

  for (const webhook of payment.project.webhooks) {
    const delivery = await prisma.webhookDelivery.create({
      data: {
        webhookId: webhook.id,
        paymentId: payment.id,
        eventType,
        payload: payloadStr,
        status: WebhookDeliveryStatus.PENDING,
      },
    });

    await attemptDelivery(delivery.id);
  }
}

export async function attemptDelivery(deliveryId: string) {
  const delivery = await prisma.webhookDelivery.findUniqueOrThrow({
    where: { id: deliveryId },
    include: { webhook: { include: { project: true } } },
  });

  if (delivery.attempts >= env.WEBHOOK_MAX_ATTEMPTS) return;

  const secret = decryptRawEvent(delivery.webhook.project.webhookSecretEncrypted);
  const signature = signWebhookPayload(delivery.payload, secret);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.WEBHOOK_TIMEOUT_MS);

    const response = await fetch(delivery.webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-GadonPay-Signature": signature,
      },
      body: delivery.payload,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const success = response.status >= 200 && response.status < 300;

    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        attempts: { increment: 1 },
        lastAttemptAt: new Date(),
        status: success ? WebhookDeliveryStatus.DELIVERED : WebhookDeliveryStatus.FAILED,
      },
    });

    if (!success) {
      logger.warn({ deliveryId, status: response.status }, "Webhook non délivré, sera retenté");
    }
  } catch (err) {
    logger.warn({ deliveryId, err }, "Échec d'envoi du webhook");
    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: { attempts: { increment: 1 }, lastAttemptAt: new Date(), status: WebhookDeliveryStatus.FAILED },
    });
  }
}

/** À exécuter périodiquement pour retenter les livraisons échouées (backoff simple). */
export async function retryFailedDeliveries() {
  const failed = await prisma.webhookDelivery.findMany({
    where: {
      status: WebhookDeliveryStatus.FAILED,
      attempts: { lt: env.WEBHOOK_MAX_ATTEMPTS },
    },
    take: 50,
  });

  for (const delivery of failed) {
    await attemptDelivery(delivery.id);
  }

  return failed.length;
}
