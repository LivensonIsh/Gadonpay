"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_TOKEN_KEY = "gadonpay_admin_token";

export function saveAdminSession(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function useRequireAdminAuth() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = getAdminToken();
    if (!t) {
      router.replace("/admin/login");
      return;
    }
    setToken(t);
    setReady(true);
  }, [router]);

  return { token, ready };
}
