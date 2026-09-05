"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearMerchantSession, getStoredMerchant } from "@/lib/auth";
import { Logo } from "@/components/Logo";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const merchant = getStoredMerchant();
  const [open, setOpen] = useState(false);

  const links = [
  { href: "/dashboard/projects", label: "Projets" },
  { href: "/dashboard/account", label: "Mon compte" },
];
  function handleLogout() {
    clearMerchantSession();
    router.replace("/login");
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
        <Logo size="small" />
        <button
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          className="rounded border border-border p-2 text-text"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 4.5H16M2 9H16M2 13.5H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-black/60 md:hidden" />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-200 md:static md:z-auto md:h-screen md:w-60 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <Logo />
          <button onClick={() => setOpen(false)} className="text-faint md:hidden" aria-label="Fermer le menu">
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
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
    </>
  );
}
