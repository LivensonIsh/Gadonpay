import { TransactionType } from "@prisma/client";

/**
 * Classification par whitelist de patterns validés — PAS de ML flou en v1
 * (section 5.2 de la spec : un OTP mal classifié comme paiement serait un
 * bug critique).
 *
 * Chaque règle est indépendante du provider : on classifie d'abord le TYPE
 * de message, l'extraction fine du provider se fait ensuite dans parser.service.ts.
 */
const CLASSIFICATION_RULES: Array<{ type: TransactionType; test: (sms: string) => boolean }> = [
  {
    type: TransactionType.OTP,
    test: (sms) => /\bOTP\b/i.test(sms) || /code de vérification/i.test(sms),
  },
  {
    type: TransactionType.BALANCE_CHECK,
    test: (sms) =>
      /^votre solde\s*:/i.test(sms.trim()) || /^your balance\s*:/i.test(sms.trim()),
  },
  {
    type: TransactionType.DEPOSIT,
    test: (sms) => /d[ée]p[ôo]t\b/i.test(sms) || /\bdeposit\b/i.test(sms),
  },
  {
    type: TransactionType.INCOMING_TRANSFER,
    test: (sms) =>
      /vous avez encaiss[ée]/i.test(sms) ||
      /vous avez re[çc]u/i.test(sms) ||
      /you (have )?received/i.test(sms),
  },
  {
    type: TransactionType.FAILED_TRANSACTION,
    test: (sms) => /transaction (a )?[ée]chou[ée]e/i.test(sms) || /transaction failed/i.test(sms),
  },
  {
    type: TransactionType.PROMO,
    test: (sms) => /(promo|offre sp[ée]ciale|bonus)/i.test(sms) && !/TransCode/i.test(sms),
  },
];

export function classifySms(rawText: string): TransactionType {
  for (const rule of CLASSIFICATION_RULES) {
    if (rule.test(rawText)) return rule.type;
  }
  return TransactionType.UNKNOWN;
}

/** Seuls ces types représentent une réception d'argent exploitable pour matcher un Payment. */
export const PAYMENT_ELIGIBLE_TYPES: TransactionType[] = [
  TransactionType.INCOMING_TRANSFER,
  TransactionType.DEPOSIT,
];
