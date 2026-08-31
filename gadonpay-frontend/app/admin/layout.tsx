"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useRequireAdminAuth } from "@/lib/adminAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) return <>{children}</>;

  return <ProtectedAdmin>{children}</ProtectedAdmin>;
}

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const { ready } = useRequireAdminAuth();
  if (!ready) return null;

  return (
    <div className="flex min-h-screen bg-bg">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
