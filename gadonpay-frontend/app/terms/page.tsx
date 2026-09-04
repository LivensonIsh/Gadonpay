import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Conditions d'utilisation" updated="Septembre 2026">
      <section>
        <h2 className="font-display text-lg text-text">1. Objet du service</h2>
        <p className="mt-2">
          GadonPay est un service de confirmation automatique de transactions NatCash et
          MonCash. GadonPay <strong className="text-text">n&apos;est pas un prestataire de
          services de paiement</strong> : il ne détient, ne reçoit ni ne déplace jamais les
          fonds de vos clients. L&apos;argent va directement du client vers le compte
          NatCash/MonCash du marchand. GadonPay se limite à détecter cette réception et à
          déclencher automatiquement l&apos;action que le marchand a configurée (webhook,
          activation, livraison).
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-text">2. Compte marchand</h2>
        <p className="mt-2">
          Vous êtes responsable de l&apos;exactitude des informations fournies à
          l&apos;inscription, de la confidentialité de votre mot de passe et de votre
          `API_KEY`, ainsi que de la légitimité des comptes NatCash/MonCash que vous ajoutez
          à votre projet. Ces comptes opérateur restent votre propriété exclusive à tout
          moment.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-text">3. Utilisation acceptable</h2>
        <p className="mt-2">
          Il est interdit d&apos;utiliser GadonPay pour intercepter des SMS non liés à des
          transactions de paiement, pour toute activité frauduleuse, de blanchiment, ou pour
          contourner les limites imposées par les opérateurs NatCash/MonCash ou par la
          réglementation applicable. GadonPay se réserve le droit de suspendre tout compte
          présentant une activité suspecte, avec information au marchand.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-text">4. Essai gratuit et tarification</h2>
        <p className="mt-2">
          L&apos;essai gratuit dure 1 semaine à compter de la création du premier projet.
          Les paliers tarifaires suivants (Starter, Business, Enterprise) seront communiqués
          avant la fin de la période d&apos;essai, avec un préavis raisonnable avant tout
          prélèvement.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-text">5. Limitation de responsabilité</h2>
        <p className="mt-2">
          GadonPay est un service en développement actif. Nous ne garantissons pas la
          disponibilité continue des réseaux NatCash/MonCash, ni l&apos;absence totale
          d&apos;interruption du service de détection SMS. GadonPay ne peut être tenu
          responsable des pertes résultant d&apos;une panne opérateur, d&apos;une
          coupure réseau côté Gateway, ou d&apos;une erreur de configuration côté marchand.
        </p>
        <p className="mt-2">
          Le statut de GadonPay au regard de la réglementation de la Banque de la République
          d&apos;Haïti (BRH) est en cours de clarification. Ceci n&apos;est pas un avis
          juridique.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-text">6. Résiliation</h2>
        <p className="mt-2">
          Vous pouvez cesser d&apos;utiliser GadonPay à tout moment. GadonPay peut suspendre
          ou résilier un compte en cas de violation de ces conditions, avec notification par
          email indiquant la raison.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-text">7. Modifications</h2>
        <p className="mt-2">
          Ces conditions peuvent évoluer à mesure que le produit se développe. Les
          changements significatifs vous seront communiqués par email avant leur entrée en
          vigueur.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-text">8. Contact</h2>
        <p className="mt-2">
          Pour toute question : <span className="text-text">contact@gadonpay.lat</span>
        </p>
      </section>
    </LegalLayout>
  );
}
