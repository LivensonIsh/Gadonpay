"use client";

import { Sidebar } from "@/components/Sidebar";
import { useRequireMerchantAuth } from "@/lib/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useRequireMerchantAuth();

  if (!ready) return null;

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
