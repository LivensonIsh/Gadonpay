import { Provider, TransactionType } from "@prisma/client";

export interface ParsedSms {
  type: TransactionType;
  transactionId: string | null;
  amount: number | null;
  fee: number | null;
  sender: string | null;
  senderPhone: string | null;
  balanceAfter: number | null;
  operatorTimestamp: Date | null;
}

/** "2,000.51" ou "1,872" → 2000.51 / 1872 (le séparateur de milliers NatCash/MonCash est la virgule). */
function parseAmount(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/,/g, "").trim();
  const value = Number.parseFloat(cleaned);
  return Number.isNaN(value) ? null : value;
}

/**
 * Haïti est en UTC-5 (pas de changement d'heure d'été observé depuis 2015).
 * Format observé : "21:55" + "28/08/2026" (JJ/MM/AAAA).
 */
function parseHaitianDateTime(time: string | undefined, date: string | undefined): Date | null {
  if (!time || !date) return null;
  const [hh, mm] = time.split(":").map(Number);
  const [dd, MM, yyyy] = date.split("/").map(Number);
  if ([hh, mm, dd, MM, yyyy].some((n) => Number.isNaN(n))) return null;
  // Construit une date ISO avec offset explicite -05:00
  const iso = `${yyyy}-${String(MM).padStart(2, "0")}-${String(dd).padStart(2, "0")}T${String(
    hh
  ).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00-05:00`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

// ─────────────────────────────────────────────────────────
// NatCash — deux formats observés : FR et EN (section 5.2 : résilience format,
// on garde toujours le raw_event brut pour pouvoir rejouer l'extraction).
// ─────────────────────────────────────────────────────────

const NATCASH_PATTERNS = {
  // "Vous avez encaisse 2,000 HTG a 21:55 28/08/2026 de ROSEMARTINE NOEL, code 248905.
  //  Votre solde: 2,000.51 HTG. TransCode: 26082822709490. Merci"
  incomingTransferFr:
    /Vous avez encaiss[ée]\s+([\d,.]+)\s*HTG\s*a\s*(\d{2}:\d{2})\s*(\d{2}\/\d{2}\/\d{4})\s*de\s*([^,]+),\s*code\s*(\d+)\.\s*Votre solde:\s*([\d,.]+)\s*HTG\.\s*TransCode:\s*(\d+)/i,

  // "Vous avez recu 3,066.81 HTG de Tranzmit a 16:20 16/07/2026. Titre : IDTII - ...
  //  Votre solde : 3,081.01 HTG. Code de transaction : 26071630168985."
  incomingTransferGenericFr:
    /Vous avez re[çc]u\s+([\d,.]+)\s*HTG\s*de\s*([^.]+?)\s*a\s*(\d{2}:\d{2})\s*(\d{2}\/\d{2}\/\d{4})\.[\s\S]*?(?:Votre solde\s*:\s*([\d,.]+)\s*HTG\.)?[\s\S]*?(?:TransCode|Code de transaction)\s*:\s*(\d+)/i,

  // "Vous avez transfere 1,872 HTG a LERICHE LUDNER 33428479 a 09:35 29/08/2026,
  //  frais: 17.5 HTG. TransCode: 26082923330673. Merci"  → sortant, pas un paiement reçu
  outgoingTransferFr:
    /Vous avez transf[ée]r[ée]\s+([\d,.]+)\s*HTG\s*a\s*([^\d]+)\s*(\d+)\s*a\s*(\d{2}:\d{2})\s*(\d{2}\/\d{2}\/\d{4}),\s*frais\s*:\s*([\d,.]+)\s*HTG\.\s*TransCode:\s*(\d+)/i,

  // "You transferred 1,015 HTG to LERICHE LUDNER 33428479 at 16:14 12/07/2026,
  //  fee: 17.5 HTG. Your balance: 14.2 HTG. TransCode: 26071222422499. Thank you"
  outgoingTransferEn:
    /You transferred\s+([\d,.]+)\s*HTG\s*to\s*([^\d]+)\s*(\d+)\s*at\s*(\d{2}:\d{2})\s*(\d{2}\/\d{2}\/\d{4}),\s*fee:\s*([\d,.]+)\s*HTG\.\s*Your balance:\s*([\d,.]+)\s*HTG\.\s*TransCode:\s*(\d+)/i,

  balanceFr:
    /Votre solde:\s*([\d,.]+)\s*HTG\s*a\s*(\d{2}:\d{2})\s*(\d{2}\/\d{2}\/\d{4})\.\s*TransCode:\s*(\d+)/i,

  balanceEn:
    /Your balance:\s*([\d,.]+)\s*HTG\s*at\s*(\d{2}:\d{2})\s*(\d{2}\/\d{2}\/\d{4})\.\s*TransCode:\s*(\d+)/i,

  otp: /OTP est\s*(\d+)/i,
};

function parseNatCash(rawText: string): ParsedSms {
  let m = NATCASH_PATTERNS.incomingTransferFr.exec(rawText);
  if (m) {
    return {
      type: TransactionType.INCOMING_TRANSFER,
      amount: parseAmount(m[1]),
      operatorTimestamp: parseHaitianDateTime(m[2], m[3]),
      sender: m[4].trim(),
      senderPhone: null, // NatCash FR encaisse donne un "code" agent, pas un numéro direct
      balanceAfter: parseAmount(m[6]),
      transactionId: m[7],
      fee: 0,
    };
  }

  m = NATCASH_PATTERNS.incomingTransferGenericFr.exec(rawText);
  if (m) {
    return {
      type: TransactionType.INCOMING_TRANSFER,
      amount: parseAmount(m[1]),
      sender: m[2].trim(),
      senderPhone: null,
      operatorTimestamp: parseHaitianDateTime(m[3], m[4]),
      balanceAfter: parseAmount(m[5]),
      transactionId: m[6],
      fee: 0,
    };
  }

  m = NATCASH_PATTERNS.outgoingTransferFr.exec(rawText);
  if (m) {
    return {
      type: TransactionType.UNKNOWN, // sortant : jamais utilisé pour matcher un Payment entrant
      amount: parseAmount(m[1]),
      sender: null,
      senderPhone: m[3],
      operatorTimestamp: parseHaitianDateTime(m[4], m[5]),
      balanceAfter: null,
      transactionId: m[7],
      fee: parseAmount(m[6]),
    };
  }

  m = NATCASH_PATTERNS.outgoingTransferEn.exec(rawText);
  if (m) {
    return {
      type: TransactionType.UNKNOWN,
      amount: parseAmount(m[1]),
      sender: null,
      senderPhone: m[3],
      operatorTimestamp: parseHaitianDateTime(m[4], m[5]),
      balanceAfter: parseAmount(m[7]),
      transactionId: m[8],
      fee: parseAmount(m[6]),
    };
  }

  m = NATCASH_PATTERNS.balanceFr.exec(rawText) ?? NATCASH_PATTERNS.balanceEn.exec(rawText);
  if (m) {
    return {
      type: TransactionType.BALANCE_CHECK,
      amount: null,
      sender: null,
      senderPhone: null,
      operatorTimestamp: parseHaitianDateTime(m[2], m[3]),
      balanceAfter: parseAmount(m[1]),
      transactionId: m[4],
      fee: null,
    };
  }

  m = NATCASH_PATTERNS.otp.exec(rawText);
  if (m) {
    return {
      type: TransactionType.OTP,
      amount: null,
      sender: null,
      senderPhone: null,
      operatorTimestamp: null,
      balanceAfter: null,
      transactionId: null, // un OTP n'a pas de TransCode — ne doit JAMAIS être traité comme paiement
      fee: null,
    };
  }

  return {
    type: TransactionType.UNKNOWN,
    amount: null,
    sender: null,
    senderPhone: null,
    operatorTimestamp: null,
    balanceAfter: null,
    transactionId: null,
    fee: null,
  };
}

// ─────────────────────────────────────────────────────────
// MonCash — ⚠️ PLACEHOLDER : à calibrer avec de vrais échantillons de SMS MonCash.
// La structure du code est prête (même pipeline que NatCash) mais ces regex
// n'ont pas encore été validées contre des messages réels MonCash.
// ─────────────────────────────────────────────────────────

const MONCASH_PATTERNS = {
  // Hypothèse de format à vérifier : "Vous avez recu 500 HTG de Jean Pierre (50912345678).
  //  Reference: MCS123456789. Solde: 1500 HTG"
  incomingTransferGuess:
    /Vous avez re[çc]u\s+([\d,.]+)\s*HTG\s*de\s*([^(]+)\(?(\d{8,})?\)?[.,]?\s*(?:Reference|Ref)\s*:\s*([A-Z0-9]+)/i,
};

function parseMonCash(rawText: string): ParsedSms {
  const m = MONCASH_PATTERNS.incomingTransferGuess.exec(rawText);
  if (m) {
    return {
      type: TransactionType.INCOMING_TRANSFER,
      amount: parseAmount(m[1]),
      sender: m[2]?.trim() ?? null,
      senderPhone: m[3] ?? null,
      operatorTimestamp: null,
      balanceAfter: null,
      transactionId: m[4],
      fee: null,
    };
  }

  return {
    type: TransactionType.UNKNOWN,
    amount: null,
    sender: null,
    senderPhone: null,
    operatorTimestamp: null,
    balanceAfter: null,
    transactionId: null,
    fee: null,
  };
}

export function parseSms(provider: Provider, rawText: string): ParsedSms {
  return provider === Provider.NATCASH ? parseNatCash(rawText) : parseMonCash(rawText);
}
