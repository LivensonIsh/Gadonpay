import type { PaymentStatus } from "./types";

export function formatAmount(amount: number, currency = "HTG"): string {
  return `${amount.toLocaleString("fr-HT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-HT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "En attente",
  DETECTED: "Détecté",
  MATCHED: "Rapproché",
  VERIFIED: "Vérifié",
  PAID: "Payé",
  EXPIRED: "Expiré",
  FLAGGED: "Signalé",
  FAILED: "Échoué",
};

export const STATUS_STYLES: Record<PaymentStatus, string> = {
  PENDING: "bg-surfaceRaised text-muted border-border",
  DETECTED: "bg-teal-dim text-teal border-teal/30",
  MATCHED: "bg-teal-dim text-teal border-teal/30",
  VERIFIED: "bg-teal-dim text-teal border-teal/30",
  PAID: "bg-amber-dim text-amber border-amber/30",
  EXPIRED: "bg-surfaceRaised text-faint border-border",
  FLAGGED: "bg-rose-dim text-rose border-rose/30",
  FAILED: "bg-rose-dim text-rose border-rose/30",
};
