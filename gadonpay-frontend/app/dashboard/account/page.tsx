"use client";

import { useEffect, useState, FormEvent } from "react";
import { apiRequest, ApiError } from "@/lib/api";
import { getMerchantToken } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input, Select } from "@/components/Input";
import { PasswordInput } from "@/components/PasswordInput";
import { DEPARTMENT_LABELS, type Department, type Merchant } from "@/lib/types";

export default function AccountPage() {
  const token = getMerchantToken();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [form, setForm] = useState({ name: "", address: "", department: "" as Department | "", phoneNumber: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");

  async function load() {
    try {
      const data = await apiRequest<{ merchant: Merchant }>("/auth/me", { token });
      setMerchant(data.merchant);
      setForm({
        name: data.merchant.name,
        address: data.merchant.address,
        department: data.merchant.department,
        phoneNumber: data.merchant.phoneNumber,
      });
    } catch {
      setProfileErr("Erreur de chargement du profil.");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    setProfileErr("");
    setProfileMsg("");
    setSavingProfile(true);
    try {
      await apiRequest("/auth/me", { method: "PATCH", token, body: form });
      setProfileMsg("Profil mis à jour.");
      await load();
    } catch (err) {
      setProfileErr(err instanceof ApiError ? err.message : "Erreur lors de la mise à jour.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPwErr("");
    setPwMsg("");
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwErr("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }
    setSavingPw(true);
    try {
      await apiRequest("/auth/change-password", {
        method: "POST",
        token,
        body: { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword },
      });
      setPwMsg("Mot de passe changé avec succès.");
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      setPwErr(err instanceof ApiError ? err.message : "Erreur lors du changement de mot de passe.");
    } finally {
      setSavingPw(false);
    }
  }

  if (!merchant) return <p className="text-sm text-faint">Chargement...</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl text-text">Mon compte</h1>
        <p className="mt-1 text-sm text-muted">
          Membre depuis {formatDate(merchant.createdAt)} · Statut :{" "}
          <span className={merchant.status === "ACTIVE" ? "text-amber" : "text-rose"}>{merchant.status}</span>
        </p>
      </div>

      <Card title="Informations du profil">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input label="Email (non modifiable)" value={merchant.email} disabled />
          <Input label="Nom" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Adresse" required value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          <Select label="Département" required value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value as Department }))}>
            {Object.entries(DEPARTMENT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
          <Input label="Numéro de téléphone" required value={form.phoneNumber} onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))} />
          {profileMsg && <p className="text-sm text-amber">{profileMsg}</p>}
          {profileErr && <p className="text-sm text-rose">{profileErr}</p>}
          <Button type="submit" loading={savingProfile}>Enregistrer</Button>
        </form>
      </Card>

      <Card title="Changer le mot de passe">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <PasswordInput label="Mot de passe actuel" required value={pwForm.currentPassword} onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))} />
          <PasswordInput label="Nouveau mot de passe" required minLength={8} value={pwForm.newPassword} onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))} />
          <PasswordInput label="Confirmer le nouveau mot de passe" required minLength={8} value={pwForm.confirm} onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} />
          {pwMsg && <p className="text-sm text-amber">{pwMsg}</p>}
          {pwErr && <p className="text-sm text-rose">{pwErr}</p>}
          <Button type="submit" loading={savingPw} variant="secondary">Changer le mot de passe</Button>
        </form>
      </Card>
    </div>
  );
}
