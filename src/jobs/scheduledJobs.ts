import { logger } from "../lib/logger";
import { expireStalePayments } from "../modules/matching/matching.service";
import { retryFailedDeliveries } from "../modules/webhooks/webhook.service";

/**
 * MVP Phase 1 : simples intervals en mémoire, suffisant pour un seul serveur.
 * Dès qu'il y a plus d'une instance backend (Phase 2/3), remplacer par une
 * vraie queue (BullMQ/Redis) pour éviter les doubles exécutions concurrentes —
 * voir section 15.1 de la spec produit (stack suggérée).
 */
export function startScheduledJobs() {
  setInterval(async () => {
    try {
      const count = await expireStalePayments();
      if (count > 0) logger.info({ count }, "Paiements expirés");
    } catch (err) {
      logger.error({ err }, "Erreur lors de l'expiration des paiements");
    }
  }, 60_000);

  setInterval(async () => {
    try {
      const count = await retryFailedDeliveries();
      if (count > 0) logger.info({ count }, "Webhooks retentés");
    } catch (err) {
      logger.error({ err }, "Erreur lors du retry des webhooks");
    }
  }, 30_000);
}
