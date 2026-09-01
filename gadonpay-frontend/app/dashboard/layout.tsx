"use client";

import { Sidebar } from "@/components/Sidebar";
import { useRequireMerchantAuth } from "@/lib/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useRequireMerchantAuth();

  if (!ready) return null;

  return (
    <div className="flex min-h-screen flex-col bg-bg md:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
