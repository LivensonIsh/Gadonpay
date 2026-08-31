"use client";

import { useEffect, useState } from "react";
import { apiRequest, ApiError } from "@/lib/api";
import { getAdminToken } from "@/lib/adminAuth";
import { formatAmount, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, EmptyState } from "@/components/Card";
import { Button } from "@/components/Button";
import type { PaymentStatus } from "@/lib/types";

interface AdminPayment {
  id: string;
  amount: number;
  currency: string;
  provider: string;
  reference: string;
  status: PaymentStatus;
  createdAt: string;
  project: { name: string; merchant: { name: string } };
}

const STATUS_FILTERS: (PaymentStatus | "ALL")[] = ["ALL", "PENDING", "PAID", "FLAGGED", "EXPIRED", "FAILED"];

export default function AdminPaymentsPage() {
  const token = getAdminToken();
  const [payments, setPayments] = useState<AdminPayment[] | null>(null);
  const [filter, setFilter] = useState<PaymentStatus | "ALL">("ALL");
  const [error, setError] = useState("");

  async function load() {
    const qs = filter === "ALL" ? "" : `?status=${filter}`;
    try {
      const data = await apiRequest<{ payments: AdminPayment[] }>(`/admin/payments${qs}`, { token });
      setPayments(data.payments);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur de chargement.");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function handleOverride(paymentId: string) {
    const reason = prompt("Raison de l'override manuel vers PAID (obligatoire, tracé dans le journal d'audit) :");
    if (!reason) return;
    try {
      await apiRequest(`/admin/payments/${paymentId}/override`, { method: "PATCH", token, body: { reason } });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de l'override.");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-text">Paiements</h1>

      <div className="flex gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded border px-3 py-1 text-xs font-mono ${
              filter === s
                ? "border-amber/30 bg-amber-dim text-amber"
                : "border-border text-muted hover:border-borderLight"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-rose">{error}</p>}

      <Card>
        {payments === null ? (
          <p className="text-sm text-faint">Chargement...</p>
        ) : payments.length === 0 ? (
          <EmptyState message="Aucun paiement pour ce filtre." />
        ) : (
          <div className="divide-y divide-border">
            {payments.map((p) => (
              <div key={p.id} className="ledger-row flex items-center justify-between py-3 first:pt-0">
                <div>
                  <p className="font-mono text-sm text-text">{formatAmount(p.amount, p.currency)}</p>
                  <p className="text-xs text-faint">
                    {p.project.merchant.name} — {p.project.name} · {p.reference} · {formatDate(p.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={p.status} />
                  {p.status === "FLAGGED" && (
                    <Button variant="secondary" onClick={() => handleOverride(p.id)}>
                      Override → PAID
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
