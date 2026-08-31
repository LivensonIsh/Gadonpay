"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { apiRequest, ApiError } from "@/lib/api";
import { getMerchantToken } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { Card, EmptyState } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { CopyableSecret } from "@/components/CopyableSecret";
import type { Project, ProjectWithSecrets } from "@/lib/types";

export default function ProjectsPage() {
  const token = getMerchantToken();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [newProject, setNewProject] = useState<ProjectWithSecrets | null>(null);

  async function loadProjects() {
    try {
      const data = await apiRequest<{ projects: Project[] }>("/projects", { token });
      setProjects(data.projects);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur de chargement.");
    }
  }

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const data = await apiRequest<{ project: ProjectWithSecrets }>("/projects", {
        method: "POST",
        token,
        body: { name },
      });
      setNewProject(data.project);
      setName("");
      await loadProjects();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de la création.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl text-text">Projets</h1>
        <p className="mt-1 text-sm text-muted">
          Chaque projet a sa propre clé API, ses comptes NatCash/MonCash et ses Gateways.
        </p>
      </div>

      {newProject && (
        <Card title="Projet créé — copie tes identifiants maintenant">
          <div className="space-y-3">
            <CopyableSecret label="API_KEY" value={newProject.apiKey} />
            <CopyableSecret label="WEBHOOK_SECRET" value={newProject.webhookSecret} />
            <p className="text-xs text-faint">
              PROJECT_ID : <code className="font-mono text-muted">{newProject.id}</code>
            </p>
          </div>
        </Card>
      )}

      <Card title="Nouveau projet">
        <form onSubmit={handleCreate} className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              label="Nom du projet"
              placeholder="Boutique en ligne"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Button type="submit" loading={creating}>
            Créer
          </Button>
        </form>
        {error && <p className="mt-2 text-sm text-rose">{error}</p>}
      </Card>

      <Card title="Tes projets">
        {projects === null ? (
          <p className="text-sm text-faint">Chargement...</p>
        ) : projects.length === 0 ? (
          <EmptyState message="Aucun projet pour le moment." />
        ) : (
          <div className="divide-y divide-border">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/projects/${p.id}`}
                className="ledger-row flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:opacity-80"
              >
                <div>
                  <p className="text-sm text-text">{p.name}</p>
                  <p className="font-mono text-xs text-faint">{p.apiKeyPrefix}...</p>
                </div>
                <span className="text-xs text-muted">{formatDate(p.createdAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
