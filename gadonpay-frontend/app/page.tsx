import Link from "next/link";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { LiquidBackground } from "@/components/LiquidBackground";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#comment-ca-marche" className="text-sm text-muted hover:text-text">
              Comment ça marche
            </a>
            <a href="#positionnement" className="text-sm text-muted hover:text-text">
              Positionnement
            </a>
            <a href="#tarifs" className="text-sm text-muted hover:text-text">
              Tarifs
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden text-sm text-muted hover:text-text sm:block">
              Se connecter
            </Link>
            <Link href="/register">
              <Button>Créer un compte</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <LiquidBackground />
        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
          <span className="mb-6 inline-block rounded-full border border-amber/30 bg-amber-dim px-3 py-1 text-xs text-amber">
            3 mois d&apos;essai gratuit
          </span>
          <h1 className="font-display text-4xl leading-tight text-text md:text-6xl">
            Vos paiements NatCash et MonCash,
            <br />
            confirmés automatiquement.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
            Le client paie directement votre portefeuille. GadonPay détecte la transaction,
            la vérifie, et déclenche votre livraison, votre abonnement ou votre crédit —
            sans jamais toucher à l&apos;argent.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/register">
              <Button className="w-full px-6 py-3 text-base sm:w-auto">
                Commencer — 3 mois gratuits
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="w-full px-6 py-3 text-base sm:w-auto">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="comment-ca-marche" className="border-t border-border bg-surface py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-display text-2xl text-text md:text-3xl">
            Comment ça marche
          </h2>
          <div className="grid gap-10 md:grid-cols-3">
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

      <section id="positionnement" className="relative overflow-hidden py-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
          <div
            className="absolute right-1/4 top-0 h-80 w-80 rounded-[50%_50%_40%_60%/60%_40%_50%_50%] blur-3xl"
            style={{ background: "radial-gradient(circle, #3FB6A8, transparent 70%)" }}
          />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-2xl text-text md:text-3xl">
            GadonPay n&apos;est pas un agrégateur
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Votre argent ne transite jamais par notre plateforme. Nous ne faisons que
            constater une transaction réelle et déclencher l&apos;action qui doit en
            découler — une couche de détection et de confirmation, pas une couche
            financière.
          </p>
        </div>
      </section>

      <section id="tarifs" className="border-t border-border bg-surface py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-4 text-center font-display text-2xl text-text md:text-3xl">Tarifs</h2>
          <p className="mx-auto mb-12 max-w-lg text-center text-sm text-muted">
            3 mois d&apos;essai gratuit pour tester avec de vrais marchands pilotes.
            Les tarifs des paliers suivants seront communiqués avant la fin de l&apos;essai.
          </p>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                name: "Free Trial",
                desc: "1 projet, 1 Gateway, 1 provider, API, dashboard, webhooks",
                highlight: true,
              },
              { name: "Starter", desc: "Pour les petits marchands — tarif à venir" },
              { name: "Business", desc: "Plusieurs comptes et Gateways — tarif à venir" },
              { name: "Enterprise", desc: "Tarification personnalisée, contactez-nous" },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded border p-5 ${
                  plan.highlight ? "border-amber/40 bg-amber-dim" : "border-border bg-bg"
                }`}
              >
                <h3 className={`font-display text-lg ${plan.highlight ? "text-amber" : "text-text"}`}>
                  {plan.name}
                </h3>
                <p className="mt-2 text-xs text-muted">{plan.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <Logo size="small" />
          <p className="text-xs text-faint">© {new Date().getFullYear()} GadonPay — Haïti</p>
        </div>
      </footer>
    </div>
  );
}
