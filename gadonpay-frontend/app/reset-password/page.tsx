"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiRequest, ApiError } from "@/lib/api";
import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (!token) {
      setError("Lien invalide — le token est manquant.");
      return;
    }
    setLoading(true);
    try {
      await apiRequest("/auth/reset-password", { method: "POST", body: { token, password } });
      router.push("/login?reset=1");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de la réinitialisation.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Logo />
          <p className="mt-2 text-sm text-muted">Choisir un nouveau mot de passe</p>
        </div>

        {!token ? (
          <p className="text-sm text-rose">
            Lien invalide. <Link href="/forgot-password" className="text-teal hover:underline">Redemandez un lien</Link>.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordInput label="Nouveau mot de passe" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
            <PasswordInput label="Confirmer le mot de passe" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            {error && <p className="text-sm text-rose">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">
              Réinitialiser le mot de passe
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
