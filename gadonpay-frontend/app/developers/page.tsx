import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { CodeBlock } from "@/components/CodeBlock";

export const metadata: Metadata = {
  title: "Documentation développeurs",
  description:
    "Intégrez GadonPay à votre site ou votre application en quelques minutes : API_KEY, POST /v1/payments, webhooks signés.",
};

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-muted hover:text-text">
              Se connecter
            </Link>
            <Link href="/register">
              <Button>Créer un compte</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-16">
        <span className="mb-3 inline-block rounded-full border border-teal/30 bg-teal-dim px-3 py-1 text-xs text-teal">
          Documentation
        </span>
        <h1 className="font-display text-3xl text-text md:text-4xl">
          Intégrer GadonPay à votre site
        </h1>
        <p className="mt-4 text-muted">
          Comme avec Stripe ou PayPal, vous intégrez une seule API. La différence :
          GadonPay ne détient jamais l&apos;argent — votre client paie directement votre
          portefeuille NatCash/MonCash, et GadonPay vous notifie quand c&apos;est confirmé.
        </p>

        <section className="mt-14">
          <h2 className="font-display text-xl text-text">1. Créer un compte et un projet</h2>
          <p className="mt-2 text-sm text-muted">
            Inscrivez-vous, créez un projet dans le dashboard — vous obtenez un{" "}
            <code className="font-mono text-amber">API_KEY</code> et un{" "}
            <code className="font-mono text-amber">WEBHOOK_SECRET</code>, affichés une seule
            fois.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl text-text">2. Ajouter votre compte NatCash/MonCash</h2>
          <p className="mt-2 text-sm text-muted">
            Le numéro qui reçoit réellement l&apos;argent de vos clients — GadonPay ne
            détient jamais ce compte, il se contente de le surveiller.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl text-text">3. Installer un Gateway</h2>
          <p className="mt-2 text-sm text-muted">
            Une app Android ou un boîtier GSM dédié qui transmet les SMS de confirmation
            reçus à GadonPay pour vérification.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl text-text">4. Créer un paiement</h2>
          <p className="mt-2 text-sm text-muted">
            Depuis votre serveur, déclarez le paiement attendu avant que le client ne paie :
          </p>
          <div className="mt-4">
            <CodeBlock>{`curl -X POST https://api.gadonpay.lat/v1/payments \\
  -H "X-Gadonpay-Key: gp_live_xxxxxxxx" \\
  -H "Idempotency-Key: order_92831" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 1500,
    "currency": "HTG",
    "provider": "natcash",
    "reference": "ORDER-83921"
  }'`}</CodeBlock>
          </div>
          <p className="mt-4 text-sm text-muted">Réponse immédiate :</p>
          <div className="mt-2">
            <CodeBlock>{`{
  "id": "pay_8F92KD",
  "status": "PENDING",
  "amount": 1500,
  "currency": "HTG",
  "provider": "natcash",
  "reference": "ORDER-83921"
}`}</CodeBlock>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl text-text">5. Recevoir la confirmation</h2>
          <p className="mt-2 text-sm text-muted">
            Dès que le client paie et que le Gateway confirme le SMS, GadonPay appelle
            votre URL de webhook avec une signature HMAC-SHA256 :
          </p>
          <div className="mt-4">
            <CodeBlock>{`POST https://votresite.ht/webhooks/gadonpay
X-GadonPay-Signature: 5f3a9c...

{
  "event": "PAYMENT_SUCCEEDED",
  "data": {
    "id": "pay_8F92KD",
    "status": "PAID",
    "amount": 1500,
    "currency": "HTG",
    "provider": "natcash",
    "reference": "ORDER-83921"
  }
}`}</CodeBlock>
          </div>
          <div className="mt-4 rounded border border-rose/30 bg-rose-dim p-4">
            <p className="text-sm text-rose">
              Règle absolue : ne livrez jamais un produit ou n&apos;activez jamais un
              abonnement sur autre chose qu&apos;un <code className="font-mono">PAYMENT_SUCCEEDED</code>{" "}
              confirmé côté serveur. Un webhook peut se perdre — revérifiez toujours via{" "}
              <code className="font-mono">GET /v1/payments/:id</code> avant de livrer.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl text-text">Idempotence</h2>
          <p className="mt-2 text-sm text-muted">
            L&apos;en-tête <code className="font-mono text-amber">Idempotency-Key</code> est
            obligatoire. Une requête répétée avec la même clé ne crée jamais un second
            paiement — utile en cas de coupure réseau, réessayez simplement avec la même clé.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl text-text">Codes d&apos;erreur</h2>
          <div className="mt-4 divide-y divide-border rounded border border-border">
            {[
              ["API_KEY_INVALID", "Clé absente, inconnue ou révoquée"],
              ["USER_SUSPENDED", "Compte marchand suspendu"],
              ["AMOUNT_INVALID", "Montant absent ou hors limites"],
              ["PROVIDER_INVALID", "Provider différent de natcash/moncash"],
              ["REFERENCE_INVALID", "Référence absente, trop longue, ou déjà utilisée"],
              ["IDEMPOTENCY_KEY_REQUIRED", "En-tête Idempotency-Key manquant"],
            ].map(([code, desc]) => (
              <div key={code} className="flex items-center justify-between px-4 py-3 text-sm">
                <code className="font-mono text-amber">{code}</code>
                <span className="text-muted">{desc}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-16 rounded border border-amber/30 bg-amber-dim p-6 text-center">
          <p className="font-display text-lg text-text">Prêt à intégrer GadonPay ?</p>
          <p className="mt-1 text-sm text-muted">1 semaine d&apos;essai gratuit, aucune carte requise.</p>
          <Link href="/register" className="mt-4 inline-block">
            <Button className="px-6 py-2.5">Créer un compte</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
