export interface SmsProvider {
  send(toPhoneE164: string, message: string): Promise<void>;
}

/**
 * Implémentation par défaut : affiche le code dans les logs serveur (dev uniquement).
 * À remplacer par un vrai fournisseur SMS avant la prod — compte + clé API requis.
 */
export class ConsoleSmsProvider implements SmsProvider {
  async send(toPhoneE164: string, message: string): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[SMS:DEV] à ${toPhoneE164} — ${message}`);
  }
}

export const smsProvider: SmsProvider = new ConsoleSmsProvider();
