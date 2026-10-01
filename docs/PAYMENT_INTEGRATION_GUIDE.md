# Guide d'intégration du paiement (pour plus tard)

> **Rien n'est connecté aujourd'hui.** Aucun compte n'a été créé, aucune clé n'existe dans le projet,
> aucun paiement n'est possible. Ce guide décrit comment brancher un prestataire le moment venu.
> Les fonctionnalités et conditions des prestataires évoluent : vérifiez toujours leur documentation
> officielle et leur disponibilité dans votre pays avant de choisir.

## 1. Principes de sécurité (non négociables)

1. **Aucune clé secrète dans le frontend.** Tout ce qui commence par `VITE_` est visible par tous.
   Seule l'URL publique de la page de paiement peut y figurer (`VITE_PREMIUM_CHECKOUT_URL`).
2. Les clés secrètes (API, signature de webhook) vont **uniquement** dans les variables d'environnement
   d'une fonction serveur (Netlify Functions, Vercel Functions, Cloudflare Workers…), jamais dans Git.
3. Le site ne collecte **jamais** de numéro de carte, de code PIN ou de code Mobile Money : le client
   paie sur la page du prestataire.
4. Un déblocage vérifié uniquement dans le navigateur peut être contourné par un utilisateur
   technique. Pour un produit à quelques dollars, c'est un risque acceptable au début ; pour être
   robuste, la licence doit être **signée par un serveur** (voir §3, option B).
5. Mettre à jour la politique de confidentialité, les conditions d'utilisation et la politique de
   remboursement **avant** l'ouverture des paiements.

## 2. Points d'intégration dans le code

| Fichier | Rôle |
|---|---|
| `src/config/plans.ts` | Droits gratuits/Premium ; `getCurrentPlan()` retourne aujourd'hui toujours `'free'` ; `PLANS.premium.available = false` |
| `src/config/site.ts` | `premiumCheckoutUrl` lu depuis `VITE_PREMIUM_CHECKOUT_URL` |
| `src/creator/StepExport.tsx` | Bouton « Débloquer l'export complet » et fenêtre d'information |
| `src/pdf/export.ts` | Applique les droits (filigrane, nombre de produits, résolution) |
| `src/pages/PricingPage.tsx` | Page Tarifs (prix à afficher seulement quand la vente est ouverte) |

## 3. Architecture recommandée (site statique)

### Option A — Lien de paiement + code de licence (le plus simple)

1. Le client clique sur « Débloquer l'export complet » → ouverture de la page de paiement du
   prestataire (`VITE_PREMIUM_CHECKOUT_URL`).
2. Après paiement, le prestataire envoie un **code de licence** par e-mail (fonction native chez
   plusieurs plateformes de vente de produits numériques).
3. Le client colle le code dans l'outil ; une fonction serveur vérifie le code auprès du prestataire.
4. Si le code est valide, l'outil mémorise localement le droit Premium (et le nombre d'exports restants).

### Option B — Webhook + jeton signé (robuste)

1. Le prestataire appelle un **webhook** (fonction serveur) après chaque paiement confirmé.
2. La fonction vérifie la signature du webhook, puis génère un **jeton de licence signé** (par exemple
   Ed25519 / JWT) avec la clé privée stockée côté serveur.
3. Le jeton est envoyé au client (e-mail ou page de confirmation).
4. Le navigateur vérifie la signature avec la **clé publique** intégrée au site : aucune clé secrète
   n'est exposée, et la vérification fonctionne même hors connexion.

Dans les deux cas, `getCurrentPlan()` devient : « Premium si une licence valide et non expirée est
présente », et le filigrane disparaît automatiquement grâce à `getEntitlements()`.

## 4. Prestataires

### Gumroad
- **Pour** : vente de produits numériques en quelques minutes, page de paiement hébergée, codes de
  licence intégrés, paiement par carte et PayPal.
- **Mise en place** : créer un produit numérique « Export Catalogue Express », activer les codes de
  licence, renseigner l'URL du produit dans `VITE_PREMIUM_CHECKOUT_URL`, vérifier les codes via leur API
  depuis une fonction serveur.
- **Limites** : Mobile Money peu ou pas disponible ; commission sur chaque vente ; prix en USD/EUR.

### Payhip
- **Pour** : similaire à Gumroad, interface simple, produits numériques, codes de licence, coupons.
- **Mise en place** : produit numérique + option clés de licence, lien de paiement dans
  `VITE_PREMIUM_CHECKOUT_URL`, vérification de la clé côté serveur.
- **Limites** : moyens de paiement surtout carte et PayPal ; peu adapté au Mobile Money.

### Flutterwave
- **Pour** : conçu pour l'Afrique : cartes, **Mobile Money** (selon les pays), virements ; page de
  paiement hébergée (« Standard ») et liens de paiement.
- **Mise en place** : compte marchand vérifié, création d'un lien de paiement ou d'un paiement
  « Standard » initié par une fonction serveur, webhook avec **secret hash** vérifié côté serveur,
  puis vérification de la transaction via l'API avec la clé secrète (serveur uniquement).
- **Limites** : vérification d'entreprise (KYB) requise ; disponibilité et moyens de paiement variables
  selon le pays (à vérifier pour la RDC).

### Stripe
- **Pour** : très fiable, Payment Links sans code, Checkout hébergé, webhooks bien documentés.
- **Mise en place** : Payment Link vers un produit « Export sans filigrane », webhook
  `checkout.session.completed` vers une fonction serveur qui génère la licence (option B).
- **Limites** : compte marchand non disponible dans de nombreux pays d'Afrique francophone ; pas de
  Mobile Money local. Pertinent surtout pour la diaspora (Europe, Amérique du Nord).

### Autres prestataires à étudier selon le pays
- **CinetPay** (zone UEMOA/CEMAC, Mobile Money), **PayDunya** (Sénégal et Afrique de l'Ouest),
  **FedaPay** (Bénin et pays voisins), **Paystack** (Nigeria, Ghana, Afrique du Sud, Kenya…),
  solutions locales en RDC (agrégateurs Mobile Money M-Pesa, Orange Money, Airtel Money).
- Critères : Mobile Money disponible dans vos pays cibles, frais, délai de versement, qualité de
  l'API et des webhooks, exigences de vérification, support en français.

## 5. Check-list d'ouverture des paiements

- [ ] Prestataire choisi et compte marchand **créé par le porteur du projet** (pas par un outil automatique).
- [ ] Produit(s) et prix créés chez le prestataire, conformes à `docs/PREMIUM_STRATEGY.md`.
- [ ] Fonction serveur déployée, secrets uniquement dans ses variables d'environnement.
- [ ] Vérification de signature des webhooks testée (paiement réussi, échoué, remboursé).
- [ ] `PLANS.premium.available = true` et `getCurrentPlan()` branché sur la licence.
- [ ] Page Tarifs mise à jour avec les vrais prix ; fenêtre « Débloquer » mise à jour.
- [ ] Politique de remboursement, CGU et confidentialité relues par un professionnel.
- [ ] Tests de bout en bout en mode test du prestataire (cartes et numéros de test officiels).
- [ ] Procédure de support et de remboursement prête.
