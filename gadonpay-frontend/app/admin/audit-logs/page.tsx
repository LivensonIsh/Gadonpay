"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { getAdminToken } from "@/lib/adminAuth";
import { formatDate } from "@/lib/format";
import { Card, EmptyState } from "@/components/Card";

interface AuditLog {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  reason: string | null;
  createdAt: string;
  adminUser: { email: string };
}

export default function AdminAuditLogsPage() {
  const token = getAdminToken();
  const [logs, setLogs] = useState<AuditLog[] | null>(null);

  useEffect(() => {
    apiRequest<{ logs: AuditLog[] }>("/admin/audit-logs", { token })
      .then((d) => setLogs(d.logs))
      .catch(() => {});
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-text">Journal d&apos;audit</h1>
        <p className="mt-1 text-sm text-muted">Append-only — toute action admin est tracée ici, sans exception.</p>
      </div>

      <Card>
        {logs === null ? (
          <p className="text-sm text-faint">Chargement...</p>
        ) : logs.length === 0 ? (
          <EmptyState message="Aucune action enregistrée." />
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <div key={log.id} className="ledger-row py-3 first:pt-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-text">{log.action}</span>
                  <span className="text-xs text-faint">{formatDate(log.createdAt)}</span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {log.adminUser.email} · {log.targetType} <code className="font-mono">{log.targetId}</code>
                </p>
                {log.reason && <p className="mt-1 text-xs text-faint">Raison : {log.reason}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
