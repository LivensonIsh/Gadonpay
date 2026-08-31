"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAdminSession } from "@/lib/adminAuth";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/admin", label: "Vue d'ensemble" },
    { href: "/admin/merchants", label: "Marchands" },
    { href: "/admin/gateways", label: "Gateways" },
    { href: "/admin/payments", label: "Paiements" },
    { href: "/admin/audit-logs", label: "Journal d'audit" },
  ];

  function handleLogout() {
    clearAdminSession();
    router.replace("/admin/login");
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border px-5 py-4">
        <span className="font-display text-lg text-text">GadonPay</span>
        <span className="ml-2 rounded border border-rose/30 bg-rose-dim px-1.5 py-0.5 text-[10px] text-rose">
          ADMIN
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block rounded px-3 py-2 text-sm ${
              pathname === link.href
                ? "bg-amber-dim text-amber"
                : "text-muted hover:bg-surfaceRaised hover:text-text"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-border px-5 py-4">
        <button onClick={handleLogout} className="text-xs text-muted hover:text-rose">
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
