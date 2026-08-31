# GadonPay — Frontend (dashboards marchand + admin)

Dashboards Next.js/React pour GadonPay — correspond à la section 7 de la spec produit
(`gadonpay-specification.md`). Deux zones distinctes :

- **`/login`, `/register`, `/dashboard/*`** — dashboard marchand (JWT `merchantAuth`)
- **`/admin/login`, `/admin/*`** — dashboard admin interne (JWT `adminAuth`, distinct)

## Prérequis

- Node.js ≥ 18
- Le backend GadonPay doit tourner et être accessible (VPS + nginx, ou en local)

## Installation locale

```bash
npm install
cp .env.local.example .env.local
# édite .env.local : NEXT_PUBLIC_API_URL doit pointer vers ton backend
npm run dev
```

Ouvre `http://localhost:3000`.

## ⚠️ Patch backend requis avant de tester

Ce frontend utilise deux routes qui n'existaient pas encore côté backend :
- `GET /projects/:id` (détail d'un projet, JWT)
- `GET /projects/:id/payments` (liste des paiements d'un projet, JWT — distincte de
  `GET /v1/payments` qui elle est authentifiée par `X-Gadonpay-Key`, pas par JWT)
- `GET /projects/:id/gateway-health` (statut agrégé des Gateways d'un projet)

Applique le patch fourni séparément sur `src/modules/projects/projects.routes.ts` de ton
backend, puis redéploie (`npm run build && pm2 restart gadonpay`) avant de tester le
dashboard marchand — sinon la page de détail d'un projet renverra des 404.

## Déploiement sur Vercel (recommandé)

Le build se fait chez Vercel, pas sur ton VPS — évite tout risque de saturation
mémoire/disque sur une machine à 1 Go de RAM.

1. Pousse ce dossier dans le même repo GitHub que le backend (ou un repo séparé, au choix).
2. Sur [vercel.com](https://vercel.com) : New Project → importe le repo → si c'est le
   même repo que le backend, indique **Root Directory** = `gadonpay-frontend` (ou le nom
   du dossier).
3. Ajoute la variable d'environnement `NEXT_PUBLIC_API_URL` dans les Project Settings
   Vercel, pointée vers ton backend (`https://api.gadonpay.lol` une fois nginx + le
   sous-domaine configurés — sinon temporairement `http://<IP_VPS>:8081`, sans HTTPS,
   uniquement pour tester).
4. Déploie. Vercel te donne une URL `https://xxx.vercel.app` immédiatement, et un domaine
   personnalisé (`gadonpay.lol` ou `app.gadonpay.lol`) configurable ensuite dans Settings → Domains.

## Créer un compte admin pour tester le dashboard admin

Le seed du backend (`npm run seed`) crée déjà un admin par défaut
(`admin@gadonpay.ht` / `ChangeMe123!` sauf si tu as défini `SEED_ADMIN_EMAIL`/
`SEED_ADMIN_PASSWORD`). Change ce mot de passe dès que possible via un accès direct
à la base — aucune interface de gestion des comptes admin n'existe encore (volontaire,
scope Phase 1 minimal, section 7.2 de la spec).

## Ce qui est fait

- Auth marchand (login/register avec les champs section 11.1) et auth admin, sessions
  séparées (tokens distincts, jamais interchangeables).
- Dashboard marchand : projets (création avec affichage unique de l'API_KEY/WEBHOOK_SECRET),
  comptes NatCash/MonCash, Gateways (enregistrement avec token affiché une fois), webhooks,
  liste des paiements avec statut FSM coloré.
- Dashboard admin : vue d'ensemble, gestion marchands (suspension/réactivation avec raison
  obligatoire), supervision Gateways (détection de silence), paiements avec filtre par statut
  et override manuel sur `FLAGGED`, journal d'audit en lecture seule.

## Ce qui n'est PAS fait

- Pas de vérification email/téléphone dans l'UI (le backend a l'API, le frontend ne
  l'appelle pas encore — à ajouter : bouton "Vérifier mon email" dans les paramètres du
  compte marchand, actuellement inexistants).
- Pas de page "Paramètres du compte" marchand (changement de mot de passe, infos profil).
- Pas de pagination sur les listes (paiements, marchands, logs) — `take: 100` côté backend,
  suffisant pour tester, à ajouter avant un vrai volume de production.
- Pas de gestion multi-utilisateurs par projet (mentionné section 7.1 de la spec comme
  "à prévoir même si non prioritaire v1").
- Compilation non vérifiée en sandbox (pas d'accès réseau pour `npm install` au moment de
  la génération) — relu à la main, mais Vercel fera le vrai test de compilation au premier
  déploiement. Regarde les logs de build Vercel si le déploiement échoue.
- Design non testé visuellement (pas de rendu réel possible ici) — les classes Tailwind
  sont cohérentes mais un premier passage visuel de ta part après déploiement est nécessaire.
