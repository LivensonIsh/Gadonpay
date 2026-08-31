"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import { apiRequest, ApiError } from "@/lib/api";
import { getMerchantToken } from "@/lib/auth";
import { formatAmount, formatDate } from "@/lib/format";
import { Card, EmptyState } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input, Select } from "@/components/Input";
import { StatusBadge } from "@/components/StatusBadge";
import { CopyableSecret } from "@/components/CopyableSecret";
import type {
  Project,
  ProviderAccount,
  Gateway,
  GatewayWithToken,
  Webhook,
  Payment,
  Provider,
} from "@/lib/types";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const token = getMerchantToken();

  const [project, setProject] = useState<Project | null>(null);
  const [accounts, setAccounts] = useState<ProviderAccount[]>([]);
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [newGatewayToken, setNewGatewayToken] = useState<GatewayWithToken | null>(null);

  const [accountForm, setAccountForm] = useState({ provider: "NATCASH" as Provider, phoneNumber: "" });
  const [webhookUrl, setWebhookUrl] = useState("");
  const [gatewayType, setGatewayType] = useState<"ANDROID" | "HARDWARE">("ANDROID");
  const [error, setError] = useState("");

  async function loadAll() {
    try {
      const [projectRes, accountsRes, gatewaysRes, webhooksRes, paymentsRes] = await Promise.all([
        apiRequest<{ project: Project }>(`/projects/${projectId}`, { token }),
        apiRequest<{ accounts: ProviderAccount[] }>(`/provider-accounts?projectId=${projectId}`, { token }),
        apiRequest<{ gateways: Gateway[] }>(`/gateways?projectId=${projectId}`, { token }),
        apiRequest<{ webhooks: Webhook[] }>(`/webhooks?projectId=${projectId}`, { token }),
        apiRequest<{ payments: Payment[] }>(`/projects/${projectId}/payments`, { token }),
      ]);
      setProject(projectRes.project);
      setAccounts(accountsRes.accounts);
      setGateways(gatewaysRes.gateways);
      setWebhooks(webhooksRes.webhooks);
      setPayments(paymentsRes.payments);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur de chargement.");
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function handleAddAccount(e: FormEvent) {
    e.preventDefault();
    try {
      await apiRequest("/provider-accounts", {
        method: "POST",
        token,
        body: { projectId, ...accountForm },
      });
      setAccountForm({ provider: "NATCASH", phoneNumber: "" });
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de l'ajout du compte.");
    }
  }

  async function handleAddWebhook(e: FormEvent) {
    e.preventDefault();
    try {
      await apiRequest("/webhooks", { method: "POST", token, body: { projectId, url: webhookUrl } });
      setWebhookUrl("");
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de l'ajout du webhook.");
    }
  }

  async function handleRegisterGateway(e: FormEvent) {
    e.preventDefault();
    try {
      const data = await apiRequest<{ gateway: GatewayWithToken }>("/gateways", {
        method: "POST",
        token,
        body: { projectId, type: gatewayType },
      });
      setNewGatewayToken(data.gateway);
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de l'enregistrement du Gateway.");
    }
  }

  if (!project) {
    return <p className="text-sm text-faint">Chargement...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl text-text">{project.name}</h1>
        <p className="mt-1 font-mono text-xs text-faint">{project.id}</p>
      </div>

      {error && <p className="text-sm text-rose">{error}</p>}

      {/* Comptes opérateur */}
      <Card title="Comptes NatCash / MonCash">
        {accounts.length === 0 ? (
          <EmptyState message="Aucun compte opérateur ajouté." />
        ) : (
          <div className="mb-4 divide-y divide-border">
            {accounts.map((a) => (
              <div key={a.id} className="ledger-row flex items-center justify-between py-2.5 first:pt-0">
                <span className="text-sm text-text">{a.provider}</span>
                <span className="font-mono text-sm text-muted">{a.phoneNumber}</span>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleAddAccount} className="flex items-end gap-3 border-t border-border pt-4">
          <Select
            label="Réseau"
            value={accountForm.provider}
            onChange={(e) => setAccountForm((f) => ({ ...f, provider: e.target.value as Provider }))}
          >
            <option value="NATCASH">NatCash</option>
            <option value="MONCASH">MonCash</option>
          </Select>
          <div className="flex-1">
            <Input
              label="Numéro (8 chiffres)"
              placeholder="34123456"
              required
              value={accountForm.phoneNumber}
              onChange={(e) => setAccountForm((f) => ({ ...f, phoneNumber: e.target.value }))}
            />
          </div>
          <Button type="submit">Ajouter</Button>
        </form>
      </Card>

      {/* Gateways */}
      <Card title="Gateways">
        {newGatewayToken && (
          <div className="mb-4">
            <CopyableSecret label={`Token Gateway (${newGatewayToken.type})`} value={newGatewayToken.token} />
            <p className="mt-2 text-xs text-faint">
              À configurer dans l&apos;app SMS-to-HTTP (SMSGate ou équivalent), pointée vers
              l&apos;endpoint <code className="font-mono">/gateways/ingest</code>.
            </p>
          </div>
        )}
        {gateways.length === 0 ? (
          <EmptyState message="Aucun Gateway enregistré." />
        ) : (
          <div className="mb-4 divide-y divide-border">
            {gateways.map((g) => (
              <div key={g.id} className="ledger-row flex items-center justify-between py-2.5 first:pt-0">
                <span className="text-sm text-text">{g.type}</span>
                <span
                  className={`font-mono text-xs ${
                    g.status === "ONLINE" ? "text-amber" : "text-faint"
                  }`}
                >
                  {g.status}
                </span>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleRegisterGateway} className="flex items-end gap-3 border-t border-border pt-4">
          <Select label="Type" value={gatewayType} onChange={(e) => setGatewayType(e.target.value as any)}>
            <option value="ANDROID">Android</option>
            <option value="HARDWARE">Matériel (Payment Node)</option>
          </Select>
          <Button type="submit">Enregistrer un Gateway</Button>
        </form>
      </Card>

      {/* Webhooks */}
      <Card title="Webhooks">
        {webhooks.length === 0 ? (
          <EmptyState message="Aucun webhook configuré." />
        ) : (
          <div className="mb-4 divide-y divide-border">
            {webhooks.map((w) => (
              <div key={w.id} className="ledger-row flex items-center justify-between py-2.5 first:pt-0">
                <span className="truncate font-mono text-sm text-text">{w.url}</span>
                <span className={`text-xs ${w.active ? "text-amber" : "text-faint"}`}>
                  {w.active ? "actif" : "inactif"}
                </span>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleAddWebhook} className="flex items-end gap-3 border-t border-border pt-4">
          <div className="flex-1">
            <Input
              label="URL"
              type="url"
              placeholder="https://tonsite.ht/webhooks/gadonpay"
              required
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
          </div>
          <Button type="submit">Ajouter</Button>
        </form>
      </Card>

      {/* Paiements */}
      <Card title="Paiements récents">
        {payments.length === 0 ? (
          <EmptyState message="Aucun paiement pour le moment." />
        ) : (
          <div className="divide-y divide-border">
            {payments.map((p) => (
              <div key={p.id} className="ledger-row flex items-center justify-between py-2.5 first:pt-0">
                <div>
                  <p className="font-mono text-sm text-text">{formatAmount(p.amount, p.currency)}</p>
                  <p className="text-xs text-faint">
                    {p.reference} · {p.provider} · {formatDate(p.createdAt)}
                  </p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
