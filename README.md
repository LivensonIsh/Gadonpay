# GadonPay — Backend (MVP Phase 1)

Service de confirmation automatique de transactions NatCash/MonCash pour Haïti.
GadonPay ne détient et ne déplace jamais l'argent : l'argent va directement dans
le portefeuille NatCash/MonCash du marchand. Ce backend détecte la réception
(lecture SMS via Gateway), la vérifie, et déclenche l'action côté marchand via
webhook — voir `gadonpay-specification.md` pour la spec produit complète.

Ce backend correspond au périmètre **Phase 1 (MVP interne)** de la roadmap :
FSM simplifié `PENDING → PAID` (+ `EXPIRED`), un seul mode Gateway (Android),
dashboard admin en lecture/actions minimales. Le FSM complet (`DETECTED`,
`MATCHED`, `VERIFIED`, `FLAGGED` avec Risk Engine) est prévu en Phase 2/3.

## Prérequis

- Node.js ≥ 20
- PostgreSQL ≥ 14 (local ou hébergé — Neon, Supabase, RDS, etc.)

## Installation

```bash
npm install
cp .env.example .env
# éditer .env : DATABASE_URL, JWT_SECRET, ADMIN_JWT_SECRET, MASTER_ENCRYPTION_KEY
npx prisma generate
npx prisma migrate dev --name init
npm run seed        # crée un compte admin de test (admin@gadonpay.ht / ChangeMe123!)
npm run dev
```

Le serveur démarre sur `http://localhost:3000`. Vérifier : `GET /health`.

## Lancer les tests

```bash
npm test
```

Tests actuels : parser SMS NatCash (calibré sur de vrais échantillons) et
classifieur anti-OTP. **Le parser MonCash est un placeholder non calibré** —
voir `src/modules/parsing/parser.service.ts`, à corriger avec de vrais SMS MonCash
avant toute mise en production sur ce rail.

## Flux d'intégration complet (exemple curl)

### 1. Inscription marchand

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Boutique Exemple",
    "email": "marchand@exemple.ht",
    "password": "motdepasse123",
    "address": "Rue Example, Pétion-Ville",
    "department": "OUEST",
    "phoneNumber": "50912345678"
  }'
```

### 2. Connexion → JWT

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"marchand@exemple.ht","password":"motdepasse123"}'
# → { "token": "..." }
```

### 3. Créer un projet (génère API_KEY + WEBHOOK_SECRET, affichés une seule fois)

```bash
curl -X POST http://localhost:3000/projects \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Boutique en ligne"}'
# → { "project": { "apiKey": "gp_live_...", "webhookSecret": "whsec_...", "id": "..." } }
```

### 4. Ajouter le numéro NatCash du marchand (celui qui reçoit l'argent)

```bash
curl -X POST http://localhost:3000/provider-accounts \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"projectId": "<PROJECT_ID>", "provider": "NATCASH", "phoneNumber": "50933704117"}'
```

### 5. Enregistrer un Gateway (Android ou Hardware)

```bash
curl -X POST http://localhost:3000/gateways \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"projectId": "<PROJECT_ID>", "type": "ANDROID"}'
# → { "gateway": { "id": "...", "token": "gwtok_..." } }
```

Le `token` est à configurer dans le composant SMS-to-HTTP tiers (SMSGate,
SMS Gateway for Android...) installé sur le téléphone du marchand, pointé vers
`POST /gateways/ingest`.

### 6. Configurer un webhook

```bash
curl -X POST http://localhost:3000/webhooks \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"projectId": "<PROJECT_ID>", "url": "https://boutique.exemple.ht/webhooks/gadonpay"}'
```

### 7. Le marchand intègre l'API publique (POST /v1/payments)

```bash
curl -X POST http://localhost:3000/v1/payments \
  -H "X-Gadonpay-Key: gp_live_..." \
  -H "Idempotency-Key: order_92831" \
  -H "Content-Type: application/json" \
  -d '{"amount": 2000, "currency": "HTG", "provider": "NATCASH", "reference": "ORDER-83921"}'
# → { "id": "...", "status": "PENDING", ... }
```

### 8. Le Gateway transmet le SMS reçu (simulateur, en attendant le vrai composant tiers)

```bash
curl -X POST http://localhost:3000/gateways/ingest \
  -H "X-Gateway-Token: gwtok_..." \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "NATCASH",
    "rawText": "Vous avez encaisse 2,000 HTG a 21:55 28/08/2026 de ROSEMARTINE NOEL, code 248905. Votre solde: 2,000.51 HTG. TransCode: 26082822709490. Merci"
  }'
```

Si le montant (2000 HTG) et le provider (NATCASH) correspondent à un `Payment`
`PENDING` du même projet dans la fenêtre de temps configurée
(`MATCHING_TIME_WINDOW_MINUTES`), le paiement passe automatiquement à `PAID`
et le webhook `payment.succeeded` (signé HMAC) part vers l'URL configurée.

### 9. Vérifier le statut du paiement

```bash
curl http://localhost:3000/v1/payments/<PAYMENT_ID> \
  -H "X-Gadonpay-Key: gp_live_..."
```

### 10. Dashboard admin

```bash
curl -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gadonpay.ht","password":"ChangeMe123!"}'

curl http://localhost:3000/admin/overview -H "Authorization: Bearer <ADMIN_JWT>"
curl http://localhost:3000/admin/gateways -H "Authorization: Bearer <ADMIN_JWT>"
```

## Ce qui est fait (Phase 1)

- Inscription/connexion marchand avec les champs requis (nom, email, mot de
  passe, adresse, département, téléphone).
- Projets avec `API_KEY` / `WEBHOOK_SECRET` générés et hashés/chiffrés (jamais
  stockés en clair).
- Comptes opérateur NatCash/MonCash (le numéro qui reçoit réellement l'argent).
- Gateways avec token dédié + endpoint d'ingestion SMS.
- Pipeline complet : classification stricte (whitelist, anti-OTP) → extraction
  regex NatCash calibrée sur échantillons réels → normalisation → chiffrement
  AES-256-GCM du SMS brut → stockage.
- Moteur de matching bidirectionnel (SMS avant ou après l'appel API) avec
  verrou anti-rejeu au niveau base (contrainte `UNIQUE(provider, transactionId)`).
- API `/v1/payments` avec idempotence stricte (`Idempotency-Key` + référence).
- Webhooks signés HMAC-SHA256 avec retry automatique.
- Dashboard admin : vue d'ensemble, gestion marchands (suspension/réactivation),
  supervision des Gateways (détection de silence), override manuel de paiement,
  journal d'audit append-only.
- Jobs planifiés : expiration des paiements `PENDING` trop anciens, retry des
  webhooks échoués.

## Ce qui n'est PAS fait — à traiter avant toute mise en production

1. **Parser MonCash non calibré.** Les regex dans `parser.service.ts` sont des
   hypothèses de format, pas des patterns validés sur de vrais SMS MonCash.
2. **Vérification email/téléphone à l'inscription** non implémentée (les champs
   `emailVerifiedAt`/`phoneVerifiedAt` existent en base mais rien ne les remplit).
3. **Jobs planifiés en `setInterval`** : fonctionne pour une seule instance
   serveur. Dès qu'il y a plus d'une instance, remplacer par une vraie queue
   (BullMQ/Redis) pour éviter les exécutions concurrentes — voir section 15.1
   de la spec produit.
4. **`MASTER_ENCRYPTION_KEY`** doit venir d'un vrai coffre-fort de secrets
   (KMS/Vault) en production, pas d'une variable d'environnement en clair sur
   le serveur applicatif.
5. **Pas de frontend.** Ce backend expose uniquement des routes API — le
   dashboard marchand (section 7.1 de la spec) et le dashboard admin (7.2)
   restent à construire côté client (Next.js/React suggéré).
6. **Risk Engine et FSM complet** (`DETECTED`, `MATCHED`, `VERIFIED`, `FLAGGED`
   avec règles de détection) sont du scope Phase 2/3, pas encore implémentés.
7. **Compilation non vérifiée en environnement sandboxé** (pas d'accès réseau
   pour `npm install` au moment de la génération) — relu manuellement mais à
   valider avec `npm install && npx prisma generate && npm run build` avant
   tout déploiement.
8. **Conformité réglementaire BRH** (section 12 de la spec) : point bloquant
   à trancher avec un juriste avant tout lancement commercial public, quel
   que soit l'état du code.

## Structure du projet

```
src/
  config/env.ts              — validation Zod des variables d'environnement
  lib/{prisma,logger}.ts     — clients partagés
  middleware/                — merchantAuth (JWT), apiKeyAuth (X-Gadonpay-Key),
                                gatewayAuth (X-Gateway-Token), adminAuth, errorHandler
  utils/crypto.ts            — hash, HMAC, chiffrement AES-256-GCM
  modules/
    auth/                    — inscription/connexion marchand
    projects/                — projets, API_KEY, WEBHOOK_SECRET
    providerAccounts/        — numéros NatCash/MonCash du marchand
    gateways/                — enregistrement + ingestion SMS
    parsing/                 — classifieur + parser NatCash/MonCash (+ tests)
    matching/                — moteur de réconciliation anti-rejeu
    payments/                — API publique /v1/payments
    webhooks/                — configuration + dispatch signé HMAC
    admin/                   — dashboard admin (overview, marchands, gateways, audit)
  jobs/scheduledJobs.ts       — expiration paiements + retry webhooks
  app.ts / server.ts          — assemblage Express + démarrage
prisma/schema.prisma          — modèle de données complet
prisma/seed.ts                 — création d'un admin de test
```
