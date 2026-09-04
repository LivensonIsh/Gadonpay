import Link from "next/link";
import { Logo } from "@/components/Logo";

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Logo />
          <Link href="/" className="text-sm text-muted hover:text-text">
            ← Retour
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-3xl text-text">{title}</h1>
        <p className="mt-2 text-xs text-faint">Dernière mise à jour : {updated}</p>
        <div className="prose-legal mt-10 space-y-8 text-sm leading-relaxed text-muted">
          {children}
        </div>
      </div>
    </div>
  );
}
