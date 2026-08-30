import { env } from "../../config/env";
import { logger } from "../logger";

export interface EmailProvider {
  send(to: string, subject: string, body: string): Promise<void>;
}

/**
 * Fallback dev : affiche le code dans les logs serveur. Utilisé automatiquement
 * si RESEND_API_KEY n'est pas configurée.
 */
export class ConsoleEmailProvider implements EmailProvider {
  async send(to: string, subject: string, body: string): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[EMAIL:DEV] à ${to} — ${subject}\n${body}`);
  }
}

/**
 * Fournisseur réel via l'API REST Resend (pas besoin de leur SDK, un simple fetch suffit).
 * https://resend.com/docs/api-reference/emails/send-email
 *
 * RESEND_FROM_EMAIL doit utiliser un domaine vérifié dans Resend (Domains > Add).
 * Tant que gadonpay.lol n'est pas vérifié, garder "onboarding@resend.dev" (sandbox Resend,
 * fonctionne immédiatement sans configuration DNS, mais uniquement pour tester).
 */
export class ResendEmailProvider implements EmailProvider {
  async send(to: string, subject: string, body: string): Promise<void> {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL,
        to: [to],
        subject,
        text: body,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error({ status: response.status, errorBody }, "Échec d'envoi email via Resend");
      throw new Error(`Resend a refusé l'envoi (HTTP ${response.status})`);
    }
  }
}

export const emailProvider: EmailProvider = env.RESEND_API_KEY
  ? new ResendEmailProvider()
  : new ConsoleEmailProvider();
