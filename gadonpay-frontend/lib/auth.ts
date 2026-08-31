"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Merchant } from "./types";

const TOKEN_KEY = "gadonpay_merchant_token";
const MERCHANT_KEY = "gadonpay_merchant";

export function saveMerchantSession(token: string, merchant: Merchant) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(MERCHANT_KEY, JSON.stringify(merchant));
}

export function getMerchantToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredMerchant(): Merchant | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(MERCHANT_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearMerchantSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(MERCHANT_KEY);
}

/** Redirige vers /login si aucun token n'est présent. À utiliser dans les layouts protégés. */
export function useRequireMerchantAuth() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = getMerchantToken();
    if (!t) {
      router.replace("/login");
      return;
    }
    setToken(t);
    setMerchant(getStoredMerchant());
    setReady(true);
  }, [router]);

  return { token, merchant, ready };
}
