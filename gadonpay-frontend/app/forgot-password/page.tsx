"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { apiRequest, ApiError } from "@/lib/api";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiRequest("/auth/forgot-password", { method: "POST", body: { email } });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur, réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Logo />
          <p className="mt-2 text-sm text-muted">Mot de passe oublié</p>
        </div>

        {sent ? (
          <div className="rounded border border-amber/30 bg-amber-dim p-4 text-sm text-text">
            Si un compte existe avec cet email, un lien de réinitialisation vient d&apos;être envoyé.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            {error && <p className="text-sm text-rose">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">
              Envoyer le lien
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/login" className="text-teal hover:underline">← Retour à la connexion</Link>
        </p>
      </div>
    </div>
  );
}
