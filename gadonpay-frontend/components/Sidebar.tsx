"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearMerchantSession, getStoredMerchant } from "@/lib/auth";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const merchant = getStoredMerchant();

  const links = [{ href: "/dashboard/projects", label: "Projets" }];

  function handleLogout() {
    clearMerchantSession();
    router.replace("/login");
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border px-5 py-4">
        <span className="font-display text-lg text-text">GadonPay</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block rounded px-3 py-2 text-sm ${
              pathname?.startsWith(link.href)
                ? "bg-amber-dim text-amber"
                : "text-muted hover:bg-surfaceRaised hover:text-text"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-border px-5 py-4">
        {merchant && <p className="mb-2 truncate text-xs text-faint">{merchant.email}</p>}
        <button onClick={handleLogout} className="text-xs text-muted hover:text-rose">
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
