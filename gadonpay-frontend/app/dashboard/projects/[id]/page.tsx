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
import type { Project, ProviderAccount, Gateway, GatewayWithToken, Webhook, Payment, Provider } from "@/lib/types";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const token = getMerchantToken();

  const [project, setProject] = useState<Project | null>(null);
  const [accounts, setAccounts] = useState<ProviderAccount[]>([]);
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [newGatewayToken, setNewGatewayToken] = useState<{ id: string; token: string } | null>(null);
  const [loadError, setLoadError] = useState("");

  const [accountForm, setAccountForm] = useState({ provider: "NATCASH" as Provider, phoneNumber: "" });
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editingPhone, setEditingPhone] = useState("");

  const [webhookUrl, setWebhookUrl] = useState("");
  const [gatewayType, setGatewayType] = useState<"ANDROID" | "HARDWARE">("ANDROID");
  const [error, setError] = useState("");

  const [projectName, setProjectName] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [regeneratingKey, setRegeneratingKey] = useState(false);
  const [regeneratingSecret, setRegeneratingSecret] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [newWebhookSecret, setNewWebhookSecret] = useState<string | null>(null);

  async function loadAll() {
    setLoadError("");
    try {
      const [projectRes, accountsRes, gatewaysRes, webhooksRes, paymentsRes] = await Promise.all([
        apiRequest<{ project: Project }>(`/projects/${projectId}`, { token }),
        apiRequest<{ accounts: ProviderAccount[] }>(`/provider-accounts?projectId=${projectId}`, { token }),
        apiRequest<{ gateways: Gateway[] }>(`/gateways?projectId=${projectId}`, { token }),
        apiRequest<{ webhooks: Webhook[] }>(`/webhooks?projectId=${projectId}`, { token }),
        apiRequest<{ payments: Payment[] }>(`/projects/${projectId}/payments`, { token }),
      ]);
      setProject(projectRes.project);
      setProjectName(projectRes.project.name);
      setAccounts(accountsRes.accounts);
      setGateways(gatewaysRes.gateways);
      setWebhooks(webhooksRes.webhooks);
      setPayments(paymentsRes.payments);
    } catch (err) {
      setLoadError(err instanceof ApiError ? `Erreur (${err.status}) : ${err.message}` : "Erreur — impossible de joindre le serveur.");
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function handleAddAccount(e: FormEvent) {
    e.preventDefault();
    try {
      await apiRequest("/provider-accounts", { method: "POST", token, body: { projectId, ...accountForm } });
      setAccountForm({ provider: "NATCASH", phoneNumber: "" });
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de l'ajout du compte.");
    }
  }

  function startEditAccount(account: ProviderAccount) {
    setEditingAccountId(account.id);
    setEditingPhone(account.phoneNumber.replace(/^509/, ""));
  }

  async function handleSaveAccountEdit(accountId: string) {
    try {
      await apiRequest(`/provider-accounts/${accountId}`, { method: "PATCH", token, body: { phoneNumber: editingPhone } });
      setEditingAccountId(null);
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de la modification.");
    }
  }

  async function handleDeleteAccount(accountId: string) {
    if (!confirm("Supprimer ce compte opérateur ?")) return;
    try {
      await apiRequest(`/provider-accounts/${accountId}`, { method: "DELETE", token });
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de la suppression.");
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
      const data = await apiRequest<{ gateway: GatewayWithToken }>("/gateways", { method: "POST", token, body: { projectId, type: gatewayType } });
      setNewGatewayToken({ id: data.gateway.id, token: data.gateway.token });
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de l'enregistrement du Gateway.");
    }
  }

  async function handleRegenerateGatewayToken(gatewayId: string) {
    if (!confirm("L'ancien token sera révoqué immédiatement. Continuer ?")) return;
    try {
      const data = await apiRequest<{ token: string }>(`/gateways/${gatewayId}/regenerate-token`, { method: "POST", token });
      setNewGatewayToken({ id: gatewayId, token: data.token });
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de la régénération.");
    }
  }

  async function handleRename(e: FormEvent) {
    e.preventDefault();
    setRenaming(true);
    try {
      await apiRequest(`/projects/${projectId}`, { method: "PATCH", token, body: { name: projectName } });
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors du renommage.");
    } finally {
      setRenaming(false);
    }
  }

  async function handleRegenerateApiKey() {
    if (!confirm("L'ancienne clé API sera révoquée immédiatement. Continuer ?")) return;
    setRegeneratingKey(true);
    try {
      const data = await apiRequest<{ apiKey: string }>(`/projects/${projectId}/regenerate-api-key`, { method: "POST", token });
      setNewApiKey(data.apiKey);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de la régénération.");
    } finally {
      setRegeneratingKey(false);
    }
  }

  async function handleRegenerateWebhookSecret() {
    if (!confirm("L'ancien secret webhook sera révoqué immédiatement. Continuer ?")) return;
    setRegeneratingSecret(true);
    try {
      const data = await apiRequest<{ webhookSecret: string }>(`/projects/${projectId}/regenerate-webhook-secret`, { method: "POST", token });
      setNewWebhookSecret(data.webhookSecret);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de la régénération.");
    } finally {
      setRegeneratingSecret(false);
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-rose">{loadError}</p>
        <Button variant="secondary" className="mt-4" onClick={loadAll}>Réessayer</Button>
      </div>
    );
  }

  if (!project) return <p className="text-sm text-faint">Chargement...</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl text-text">{project.name}</h1>
        <p className="mt-1 font-mono text-xs text-faint">Projet #{project.displayNumber}</p>
      </div>

      {error && <p className="text-sm text-rose">{error}</p>}

      <Card title="Paramètres du projet">
        <form onSubmit={handleRename} className="flex items-end gap-3">
          <div className="flex-1">
            <Input label="Nom du projet" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
          </div>
          <Button type="submit" loading={renaming} variant="secondary">Renommer</Button>
        </form>
        <div className="mt-5 space-y-3 border-t border-border pt-5">
          {newApiKey && <CopyableSecret label="Nouvelle API_KEY" value={newApiKey} />}
          {newWebhookSecret && <CopyableSecret label="Nouveau WEBHOOK_SECRET" value={newWebhookSecret} />}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" loading={regeneratingKey} onClick={handleRegenerateApiKey}>Régénérer l&apos;API_KEY</Button>
            <Button variant="secondary" loading={regeneratingSecret} onClick={handleRegenerateWebhookSecret}>Régénérer le WEBHOOK_SECRET</Button>
          </div>
        </div>
      </Card>

      <Card title="Comptes NatCash / MonCash">
        {accounts.length === 0 ? (
          <EmptyState message="Aucun compte opérateur ajouté." />
        ) : (
          <div className="mb-4 divide-y divide-border">
            {accounts.map((a) => (
              <div key={a.id} className="ledger-row py-2.5 first:pt-0">
                {editingAccountId === a.id ? (
                  <div className="flex items-end gap-2">
                    <span className="pb-2 text-sm text-text">{a.provider}</span>
                    <div className="flex-1">
                      <Input label="Nouveau numéro" value={editingPhone} onChange={(e) => setEditingPhone(e.target.value)} />
                    </div>
                    <Button onClick={() => handleSaveAccountEdit(a.id)}>Sauver</Button>
                    <Button variant="secondary" onClick={() => setEditingAccountId(null)}>Annuler</Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-text">{a.provider}</span>
                      <span className="ml-3 font-mono text-sm text-muted">{a.phoneNumber}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => startEditAccount(a)}>Modifier</Button>
                      <Button variant="danger" onClick={() => handleDeleteAccount(a.id)}>Supprimer</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleAddAccount} className="flex items-end gap-3 border-t border-border pt-4">
          <Select label="Réseau" value={accountForm.provider} onChange={(e) => setAccountForm((f) => ({ ...f, provider: e.target.value as Provider }))}>
            <option value="NATCASH">NatCash</option>
            <option value="MONCASH">MonCash</option>
          </Select>
          <div className="flex-1">
            <Input label="Numéro (8 chiffres)" placeholder="34123456" required value={accountForm.phoneNumber} onChange={(e) => setAccountForm((f) => ({ ...f, phoneNumber: e.target.value }))} />
          </div>
          <Button type="submit">Ajouter</Button>
        </form>
      </Card>

      <Card title="Gateways">
        {newGatewayToken && (
          <div className="mb-4">
            <CopyableSecret label="Token Gateway" value={newGatewayToken.token} />
            <p className="mt-2 text-xs text-faint">À configurer dans l&apos;app SMS-to-HTTP, pointée vers <code className="font-mono">/gateways/ingest</code>.</p>
          </div>
        )}
        {gateways.length === 0 ? (
          <EmptyState message="Aucun Gateway enregistré." />
        ) : (
          <div className="mb-4 divide-y divide-border">
            {gateways.map((g) => (
              <div key={g.id} className="ledger-row flex items-center justify-between py-2.5 first:pt-0">
                <div>
                  <span className="text-sm text-text">{g.type}</span>
                  <span className={`ml-3 font-mono text-xs ${g.status === "ONLINE" ? "text-amber" : "text-faint"}`}>{g.status}</span>
                </div>
                <Button variant="secondary" onClick={() => handleRegenerateGatewayToken(g.id)}>Régénérer le token</Button>
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

      <Card title="Webhooks">
        {webhooks.length === 0 ? (
          <EmptyState message="Aucun webhook configuré." />
        ) : (
          <div className="mb-4 divide-y divide-border">
            {webhooks.map((w) => (
              <div key={w.id} className="ledger-row flex items-center justify-between py-2.5 first:pt-0">
                <span className="truncate font-mono text-sm text-text">{w.url}</span>
                <span className={`text-xs ${w.active ? "text-amber" : "text-faint"}`}>{w.active ? "actif" : "inactif"}</span>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleAddWebhook} className="flex items-end gap-3 border-t border-border pt-4">
          <div className="flex-1">
            <Input label="URL" type="url" placeholder="https://tonsite.ht/webhooks/gadonpay" required value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} />
          </div>
          <Button type="submit">Ajouter</Button>
        </form>
      </Card>

      <Card title="Paiements récents">
        {payments.length === 0 ? (
          <EmptyState message="Aucun paiement pour le moment." />
        ) : (
          <div className="divide-y divide-border">
            {payments.map((p) => (
              <div key={p.id} className="ledger-row flex items-center justify-between py-2.5 first:pt-0">
                <div>
                  <p className="font-mono text-sm text-text">{formatAmount(p.amount, p.currency)}</p>
                  <p className="text-xs text-faint">{p.reference} · {p.provider} · {formatDate(p.createdAt)}</p>
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
