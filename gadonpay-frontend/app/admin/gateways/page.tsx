"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { getAdminToken } from "@/lib/adminAuth";
import { formatDate } from "@/lib/format";
import { Card, EmptyState } from "@/components/Card";

interface AdminGateway {
  id: string;
  type: "ANDROID" | "HARDWARE";
  status: string;
  lastHeartbeatAt: string | null;
  silent: boolean;
  project: { name: string; merchant: { name: string } };
}

export default function AdminGatewaysPage() {
  const token = getAdminToken();
  const [gateways, setGateways] = useState<AdminGateway[] | null>(null);

  useEffect(() => {
    apiRequest<{ gateways: AdminGateway[] }>("/admin/gateways", { token })
      .then((d) => setGateways(d.gateways))
      .catch(() => {});
  }, [token]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-text">Gateways</h1>

      <Card>
        {gateways === null ? (
          <p className="text-sm text-faint">Chargement...</p>
        ) : gateways.length === 0 ? (
          <EmptyState message="Aucun Gateway enregistré sur la plateforme." />
        ) : (
          <div className="divide-y divide-border">
            {gateways.map((g) => (
              <div key={g.id} className="ledger-row flex items-center justify-between py-3 first:pt-0">
                <div>
                  <p className="text-sm text-text">
                    {g.project.merchant.name} — {g.project.name}
                  </p>
                  <p className="text-xs text-faint">
                    {g.type} ·{" "}
                    {g.lastHeartbeatAt ? `dernier signal ${formatDate(g.lastHeartbeatAt)}` : "jamais connecté"}
                  </p>
                </div>
                <span
                  className={`rounded border px-2 py-0.5 text-xs font-mono ${
                    g.silent ? "border-rose/30 bg-rose-dim text-rose" : "border-amber/30 bg-amber-dim text-amber"
                  }`}
                >
                  {g.silent ? "silencieux" : "actif"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
