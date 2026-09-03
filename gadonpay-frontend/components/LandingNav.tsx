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
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden text-sm text-muted hover:text-text sm:block">
            Se connecter
          </Link>
          <Link href="/register">
            <Button className="transition-transform hover:scale-105 active:scale-95">
              Créer un compte
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
