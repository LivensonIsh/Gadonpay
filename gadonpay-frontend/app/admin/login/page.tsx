"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, ApiError } from "@/lib/api";
import { saveAdminSession } from "@/lib/adminAuth";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiRequest<{ token: string }>("/admin/login", {
        method: "POST",
        body: { email, password },
      });
      saveAdminSession(data.token);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 font-display text-2xl text-text">GadonPay</h1>
        <p className="mb-8 text-sm text-rose">Accès administrateur interne</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label="Mot de passe"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-rose">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            Se connecter
          </Button>
        </form>
      </div>
    </div>
  );
}
