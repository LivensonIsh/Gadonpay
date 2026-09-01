import Link from "next/link";
import { Button } from "@/components/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="font-display text-lg text-text">GadonPay</span>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-muted hover:text-text">
              Se connecter
            </Link>
            <Link href="/register">
              <Button>Créer un compte</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="font-display text-4xl leading-tight text-text md:text-5xl">
          Vos paiements NatCash et MonCash,
          <br />
          confirmés automatiquement.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
          Le client paie directement votre portefeuille. GadonPay détecte la transaction,
          la vérifie, et déclenche votre livraison, votre abonnement ou votre crédit —
          sans jamais toucher à l&apos;argent.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/register">
            <Button className="px-6 py-3 text-base">Commencer — 3 mois gratuits</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" className="px-6 py-3 text-base">
              Se connecter
            </Button>
          </Link>
        </div>
      </section>

      <section className="border-t border-border bg-surface py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-10 text-center font-display text-2xl text-text">Comment ça marche</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Le client paie",
                text: "Directement sur votre numéro NatCash ou MonCash — comme d'habitude, rien ne change pour lui.",
              },
              {
                step: "02",
                title: "GadonPay détecte",
                text: "Votre Gateway capte la confirmation SMS, vérifie le montant et le code de transaction.",
              },
              {
                step: "03",
                title: "Votre action se déclenche",
                text: "Livraison, activation premium ou crédit de compte — automatiquement, via webhook signé.",
              },
            ].map((item) => (
              <div key={item.step}>
                <span className="font-mono text-sm text-amber">{item.step}</span>
                <h3 className="mt-2 font-display text-lg text-text">{item.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="font-display text-2xl text-text">GadonPay n&apos;est pas un agrégateur</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Votre argent ne transite jamais par notre plateforme. Nous ne faisons que
          constater une transaction réelle et déclencher l&apos;action qui doit en
          découler — une couche de détection et de confirmation, pas une couche
          financière.
        </p>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-5xl px-6 text-center text-xs text-faint">
          © {new Date().getFullYear()} GadonPay — Haïti
        </div>
      </footer>
    </div>
  );
}
