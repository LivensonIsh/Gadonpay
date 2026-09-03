import Link from "next/link";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { AnimatedGradientCanvas } from "@/components/AnimatedGradientCanvas";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { LandingNav } from "@/components/LandingNav";
import { CountUp } from "@/components/CountUp";
import { DEPARTMENT_LABELS } from "@/lib/types";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <LandingNav />

      <section className="relative overflow-hidden">
        <AnimatedGradientCanvas />
        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
          <RevealOnScroll>
            <span className="mb-6 inline-block rounded-full border border-amber/30 bg-amber-dim px-3 py-1 text-xs text-amber">
              1 semaine d&apos;essai gratuit
            </span>
          </RevealOnScroll>
          <RevealOnScroll delay={80}>
            <h1 className="font-display text-4xl leading-tight text-text md:text-6xl">
              Vos paiements NatCash et MonCash,
              <br />
              confirmés automatiquement.
            </h1>
          </RevealOnScroll>
          <RevealOnScroll delay={160}>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
              Le client paie directement votre portefeuille. GadonPay détecte la transaction,
              la vérifie, et déclenche votre livraison, votre abonnement ou votre crédit —
              sans jamais toucher à l&apos;argent.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={240}>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/register">
                <Button className="w-full px-6 py-3 text-base transition-transform hover:scale-105 active:scale-95 sm:w-auto">
                  Commencer — 1 semaine gratuite
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="secondary"
                  className="w-full px-6 py-3 text-base transition-transform hover:scale-105 active:scale-95 sm:w-auto"
                >
                  Se connecter
                </Button>
              </Link>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={320}>
            <div className="mt-10 flex items-center justify-center gap-3">
              <span className="text-xs text-faint">Compatible avec</span>
              <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
                NatCash
              </span>
              <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
                MonCash
              </span>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section id="comment-ca-marche" className="border-t border-border bg-surface py-20">
        <div className="mx-auto max-w-4xl px-6">
          <RevealOnScroll>
            <h2 className="mb-12 text-center font-display text-2xl text-text md:text-3xl">
              Comment ça marche
            </h2>
          </RevealOnScroll>
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
            ].map((item, i) => (
              <RevealOnScroll key={item.step} delay={i * 120}>
                <div className="group rounded border border-border bg-bg p-5 transition-colors hover:border-amber/30">
                  <span className="font-mono text-sm text-amber">{item.step}</span>
                  <h3 className="mt-2 font-display text-lg text-text">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{item.text}</p>
                </div>
              </RevealOnScroll>
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
          <RevealOnScroll>
            <h2 className="font-display text-2xl text-text md:text-3xl">
              GadonPay n&apos;est pas un agrégateur
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Votre argent ne transite jamais par notre plateforme. Nous ne faisons que
              constater une transaction réelle et déclencher l&apos;action qui doit en
              découler — une couche de détection et de confirmation, pas une couche
              financière.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <section id="couverture" className="border-t border-border bg-surface py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <RevealOnScroll>
            <h2 className="font-display text-2xl text-text md:text-3xl">Couverture nationale</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
              GadonPay vise à servir des marchands dans les 10 départements d&apos;Haïti dès
              le lancement — via Gateway Android ou matériel, où que vous soyez.
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={100}>
            <div className="mt-10 grid grid-cols-3 gap-6 sm:grid-cols-3">
              <div>
                <p className="font-mono text-3xl text-amber">
                  <CountUp to={10} />
                </p>
                <p className="mt-1 text-xs text-muted">départements visés</p>
              </div>
              <div>
                <p className="font-mono text-3xl text-amber">
                  <CountUp to={0} suffix=" HTG" />
                </p>
                <p className="mt-1 text-xs text-muted">jamais détenu par GadonPay</p>
              </div>
              <div>
                <p className="font-mono text-3xl text-amber">1 sem.</p>
                <p className="mt-1 text-xs text-muted">d&apos;essai gratuit</p>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={200}>
            <div className="mx-auto mt-10 flex max-w-2xl flex-wrap justify-center gap-2">
              {Object.values(DEPARTMENT_LABELS).map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-border bg-bg px-3 py-1 text-xs text-muted"
                >
                  {label}
                </span>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section id="tarifs" className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <RevealOnScroll>
            <h2 className="mb-4 text-center font-display text-2xl text-text md:text-3xl">Tarifs</h2>
            <p className="mx-auto mb-12 max-w-lg text-center text-sm text-muted">
              1 semaine d&apos;essai gratuit pour tester avec de vrais marchands pilotes.
              Les tarifs des paliers suivants seront communiqués avant la fin de l&apos;essai.
            </p>
          </RevealOnScroll>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                name: "Essai gratuit",
                desc: "1 semaine — 1 projet, 1 Gateway, 1 provider, API, dashboard, webhooks",
                highlight: true,
              },
              { name: "Starter", desc: "Pour les petits marchands — tarif à venir" },
              { name: "Business", desc: "Plusieurs comptes et Gateways — tarif à venir" },
              { name: "Enterprise", desc: "Tarification personnalisée, contactez-nous" },
            ].map((plan, i) => (
              <RevealOnScroll key={plan.name} delay={i * 100}>
                <div
                  className={`h-full rounded border p-5 transition-transform hover:-translate-y-1 ${
                    plan.highlight ? "border-amber/40 bg-amber-dim" : "border-border bg-surface"
                  }`}
                >
                  <h3 className={`font-display text-lg ${plan.highlight ? "text-amber" : "text-text"}`}>
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-xs text-muted">{plan.desc}</p>
                </div>
              </RevealOnScroll>
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
