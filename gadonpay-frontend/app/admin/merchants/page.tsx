"use client";

import { useEffect, useState } from "react";
import { apiRequest, ApiError } from "@/lib/api";
import { getAdminToken } from "@/lib/adminAuth";
import { formatDate } from "@/lib/format";
import { DEPARTMENT_LABELS, type Department } from "@/lib/types";
import { Card, EmptyState } from "@/components/Card";
import { Button } from "@/components/Button";

interface AdminMerchant {
  id: string;
  name: string;
  email: string;
  department: Department;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  _count: { projects: number };
}

export default function AdminMerchantsPage() {
  const token = getAdminToken();
  const [merchants, setMerchants] = useState<AdminMerchant[] | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const data = await apiRequest<{ merchants: AdminMerchant[] }>(
        `/admin/merchants?search=${encodeURIComponent(search)}`,
        { token }
      );
      setMerchants(data.merchants);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur de chargement.");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleStatus(m: AdminMerchant) {
    const reason = prompt(
      m.status === "ACTIVE" ? "Raison de la suspension :" : "Confirmer la réactivation (raison optionnelle) :"
    );
    if (m.status === "ACTIVE" && !reason) return; // suspension exige une raison, section 7.2

    try {
      if (m.status === "ACTIVE") {
        await apiRequest(`/admin/merchants/${m.id}/suspend`, { method: "PATCH", token, body: { reason } });
      } else {
        await apiRequest(`/admin/merchants/${m.id}/reactivate`, { method: "PATCH", token });
      }
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de l'action.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-text">Marchands</h1>
        <input
          placeholder="Rechercher (email, nom)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          className="rounded border border-border bg-surface px-3 py-1.5 text-sm text-text placeholder:text-faint focus:border-amber focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-rose">{error}</p>}

      <Card>
        {merchants === null ? (
          <p className="text-sm text-faint">Chargement...</p>
        ) : merchants.length === 0 ? (
          <EmptyState message="Aucun marchand trouvé." />
        ) : (
          <div className="divide-y divide-border">
            {merchants.map((m) => (
              <div key={m.id} className="ledger-row flex items-center justify-between py-3 first:pt-0">
                <div>
                  <p className="text-sm text-text">{m.name}</p>
                  <p className="text-xs text-faint">
                    {m.email} · {DEPARTMENT_LABELS[m.department]} · {m._count.projects} projet(s) ·{" "}
                    {formatDate(m.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono text-xs ${m.status === "ACTIVE" ? "text-amber" : "text-rose"}`}
                  >
                    {m.status}
                  </span>
                  <Button variant={m.status === "ACTIVE" ? "danger" : "secondary"} onClick={() => toggleStatus(m)}>
                    {m.status === "ACTIVE" ? "Suspendre" : "Réactiver"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
