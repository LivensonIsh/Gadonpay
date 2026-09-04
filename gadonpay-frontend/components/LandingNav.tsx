"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";

const SECTIONS = [
  { id: "comment-ca-marche", label: "Comment ça marche" },
  { id: "positionnement", label: "Positionnement" },
  { id: "couverture", label: "Couverture" },
  { id: "tarifs", label: "Tarifs" },
];

export function LandingNav() {
  const [active, setActive] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`text-sm transition-colors ${
                active === s.id ? "text-amber" : "text-muted hover:text-text"
              }`}
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 sm:flex">
          <Link href="/developers" className="text-sm text-muted hover:text-text">
            Développeurs
          </Link>
          <Link href="/login" className="text-sm text-muted hover:text-text">
            Se connecter
          </Link>
          <Link href="/register">
            <Button className="transition-transform hover:scale-105 active:scale-95">
              Créer un compte
            </Button>
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Ouvrir le menu"
          className="rounded border border-border p-2 text-text sm:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 4.5H16M2 9H16M2 13.5H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-30 flex flex-col bg-bg sm:hidden">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <Logo />
            <button onClick={() => setMenuOpen(false)} aria-label="Fermer le menu" className="text-faint">
              ✕
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-1 px-6 py-6">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setMenuOpen(false)}
                className="border-b border-border py-4 text-base text-text"
              >
                {s.label}
              </a>
            ))}
            <Link href="/developers" onClick={() => setMenuOpen(false)} className="border-b border-border py-4 text-base text-text">
              Développeurs
            </Link>
            <Link href="/login" onClick={() => setMenuOpen(false)} className="border-b border-border py-4 text-base text-text">
              Se connecter
            </Link>
          </nav>
          <div className="px-6 pb-8">
            <Link href="/register" onClick={() => setMenuOpen(false)}>
              <Button className="w-full py-3">Créer un compte</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
