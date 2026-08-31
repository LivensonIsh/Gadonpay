"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest, ApiError } from "@/lib/api";
import { Input, Select } from "@/components/Input";
import { Button } from "@/components/Button";
import { DEPARTMENT_LABELS, type Department } from "@/lib/types";

const initialForm = {
  name: "",
  email: "",
  password: "",
  address: "",
  department: "" as Department | "",
  phoneNumber: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiRequest("/auth/register", { method: "POST", body: form });
      router.push("/login?registered=1");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 font-display text-2xl text-text">GadonPay</h1>
        <p className="mb-8 text-sm text-muted">Créer un compte marchand</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nom" required value={form.name} onChange={(e) => update("name", e.target.value)} />
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
          <Input
            label="Mot de passe"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
          <Input
            label="Adresse"
            required
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
          />
          <Select
            label="Département"
            required
            value={form.department}
            onChange={(e) => update("department", e.target.value as Department)}
          >
            <option value="" disabled>
              Sélectionner...
            </option>
            {Object.entries(DEPARTMENT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Input
            label="Numéro de téléphone"
            placeholder="50912345678"
            required
            value={form.phoneNumber}
            onChange={(e) => update("phoneNumber", e.target.value)}
          />

          {error && <p className="text-sm text-rose">{error}</p>}

          <Button type="submit" loading={loading} className="w-full">
            Créer mon compte
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-teal hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
