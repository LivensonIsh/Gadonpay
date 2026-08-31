"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { getAdminToken } from "@/lib/adminAuth";
import { Card } from "@/components/Card";

interface Overview {
  merchantCount: number;
  paymentCount: number;
  paidCount: number;
  flaggedCount: number;
}

export default function AdminOverviewPage() {
  const token = getAdminToken();
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    apiRequest<Overview>("/admin/overview", { token }).then(setData).catch(() => {});
  }, [token]);

  const stats = [
    { label: "Marchands", value: data?.merchantCount },
    { label: "Paiements totaux", value: data?.paymentCount },
    { label: "Paiements payés", value: data?.paidCount },
    { label: "Signalés", value: data?.flaggedCount, accent: true },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-text">Vue d&apos;ensemble</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-xs text-muted">{s.label}</p>
            <p className={`mt-1 font-mono text-2xl ${s.accent ? "text-rose" : "text-text"}`}>
              {s.value ?? "—"}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
