import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Politique de confidentialité" updated="Septembre 2026">
      <section>
        <h2 className="font-display text-lg text-text">1. Données collectées</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Informations d&apos;inscription : nom, email, mot de passe (haché), adresse, département, numéro de téléphone.</li>
          <li>Contenu des SMS de confirmation de transaction, chiffré (AES-256-GCM) au repos dès réception par le Gateway.</li>
          <li>Journaux techniques : horodatage, statut des requêtes API, adresse IP des appels à l&apos;API (pour la sécurité et le débogage).</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-lg text-text">2. Pourquoi ces données</h2>
        <p className="mt-2">
          Exclusivement pour faire fonctionner le service : rapprocher un SMS avec un
          paiement attendu, afficher votre tableau de bord, détecter les tentatives de
          fraude (réutilisation d&apos;un code de transaction), et vous contacter en cas de
          problème sur votre compte.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-text">3. Partage des données</h2>
        <p className="mt-2">
          GadonPay ne vend jamais vos données. Elles sont partagées uniquement avec les
          sous-traitants techniques strictement nécessaires au fonctionnement du service :
          hébergement (VPS), base de données (Neon), envoi d&apos;email transactionnel
          (Resend). Aucune donnée n&apos;est transmise à NatCash ou MonCash au-delà de ce qui
          transite déjà naturellement par SMS entre eux et votre téléphone.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-text">4. Sécurité</h2>
        <p className="mt-2">
          Mots de passe hachés (bcrypt), clés API hachées (jamais stockées en clair), SMS
          bruts chiffrés (AES-256-GCM), accès marchand et accès admin strictement séparés
          par des jetons distincts. Toute action administrative sur un compte marchand est
          journalisée de façon permanente et non modifiable.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-text">5. Conservation</h2>
        <p className="mt-2">
          Vos données sont conservées tant que votre compte reste actif. Les journaux
          d&apos;audit liés à des transactions financières peuvent être conservés plus
          longtemps si une obligation légale ou réglementaire l&apos;exige.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-text">6. Vos droits</h2>
        <p className="mt-2">
          Vous pouvez demander l&apos;accès, la correction ou la suppression de vos données
          à tout moment en écrivant à{" "}
          <span className="text-text">contact@gadonpay.lat</span>, sous réserve des
          obligations légales de conservation qui pourraient s&apos;appliquer aux données
          financières.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-text">7. Cookies</h2>
        <p className="mt-2">
          Le tableau de bord GadonPay utilise le stockage local de votre navigateur pour
          maintenir votre session connectée. Nous n&apos;utilisons aucun cookie publicitaire
          ou de suivi tiers.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-text">8. Modifications</h2>
        <p className="mt-2">
          Cette politique peut évoluer. Toute modification substantielle vous sera
          communiquée par email.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-text">9. Contact</h2>
        <p className="mt-2">
          <span className="text-text">contact@gadonpay.lat</span>
        </p>
      </section>
    </LegalLayout>
  );
}
