# Catalogue Express

**Transformez vos photos produits en catalogue PDF professionnel**, prêt à partager sur WhatsApp,
Facebook, Instagram ou par e-mail. Application web 100 % frontend, en français, pensée d'abord pour les
téléphones Android et les petits commerçants francophones (Afrique et diaspora).

> Vos photos et les informations de vos produits restent sur votre appareil pendant la création de
> votre catalogue : tout est traité dans le navigateur, rien n'est envoyé sur un serveur.

## Fonctionnalités

- **Parcours guidé en 5 étapes** avec barre de progression : Boutique → Produits → Modèle → Aperçu → Télécharger.
- **Boutique** : nom, slogan, propriétaire, WhatsApp, téléphone, e-mail, adresse, Instagram, Facebook,
  devise (USD par défaut, CDF, EUR, FCFA ou symbole personnalisé), couleur principale, logo,
  bouton « Utiliser des données d'exemple ».
- **Produits** : photo, nom, prix, ancien prix, description, catégorie, référence, disponibilité ;
  modifier, dupliquer, supprimer (avec annulation), monter/descendre, tri (nom, prix), filtre par
  catégorie, ajout de plusieurs photos d'un coup, « Charger une boutique exemple » (4 boutiques fictives
  de 13 à 14 produits). Jusqu'à 200 produits dans l'éditeur.
- **Photos optimisées localement** : orientation corrigée, réduction (≤ 1600 px), compression JPEG,
  miniatures légères ; messages clairs pour les formats non pris en charge, HEIC, fichiers trop lourds
  (> 25 Mo) ou abîmés.
- **4 modèles réellement différents** : Minimal clair, Mode élégante, Cosmétiques moderne, Épicerie et
  restauration colorée ; A4 portrait/paysage, 3 tailles de grille, couleur, titre de couverture,
  options (descriptions, ancien prix, contacts, référence/disponibilité, regroupement par catégorie,
  liens WhatsApp, cadrage des photos).
- **Aperçu fidèle** : le même moteur de mise en page produit l'aperçu (SVG) et le PDF (jsPDF).
- **PDF propre** : texte vectoriel net, photos recadrées sans déformation, prix bien visibles, numéros de
  page, coordonnées sur chaque page, liens WhatsApp cliquables (message pré-rempli par produit),
  aucun texte qui déborde (retour à la ligne et « … » calculés), fichier léger.
- **Téléchargement** avec nom propre (`catalogue-nom-de-la-boutique-AAAA-MM-JJ.pdf`), partage via la
  feuille de partage du téléphone quand elle est disponible, progression et messages d'erreur clairs.
- **Sauvegarde locale** (localStorage + IndexedDB) activée par défaut, désactivable, effaçable.
- **Offre Premium préparée mais inactive** : export de démonstration gratuit (mention « version démo »),
  fenêtre « Débloquer l'export complet » honnête, aucun paiement.
- **Site complet** : accueil, modèles, exemples, tarifs, FAQ, contact, pages légales (brouillons), 404 ;
  pages pré-rendues pour le SEO, Open Graph, sitemap, robots.txt.

## Technologies

| Outil | Rôle |
|---|---|
| [React 19](https://react.dev) + TypeScript 6 | Interface |
| [Vite 8](https://vite.dev) | Développement, build, pré-rendu (build SSR) |
| [jsPDF 4](https://github.com/parallax/jsPDF) | Création du PDF dans le navigateur (seule dépendance de production avec React) |
| CSS moderne (variables, grid, `:has`) | Styles, sans framework |
| [Vitest 5](https://vitest.dev) | Tests unitaires (mise en page, prix, PDF réel dans Node) |
| [Playwright](https://playwright.dev) | Tests navigateur avec **Edge déjà installé** (aucun navigateur téléchargé) |
| [pdf-lib](https://pdf-lib.js.org) (dév.) | Métriques des polices standard et relecture des PDF dans les tests |
| [pdf.js](https://mozilla.github.io/pdf.js/) (dév.) | Visionneuse de contrôle qualité `qa/pdf-viewer.html` |
| [axe-core](https://github.com/dequelabs/axe-core) (dév.) | Audit d'accessibilité WCAG 2.1 AA dans les tests navigateur |
| ESLint 9 (+ jsx-a11y, react-hooks), Prettier | Qualité et accessibilité du code |

Dépendances de production : `react`, `react-dom`, `jspdf`. jsPDF n'est chargé qu'au moment de créer le PDF.

## Prérequis

- Node.js **20 ou plus** (testé avec Node 24) et npm.
- Pour les tests navigateur : Microsoft Edge installé (ou Chrome avec `PW_CHANNEL=chrome`).

## Installation

```bash
npm install
```

## Lancer en développement

```bash
npm run dev
```

Puis ouvrir http://localhost:5173.

## Build de production

```bash
npm run build
```

Le site statique est généré dans `dist/` (pages pré-rendues, `404.html`, `sitemap.xml`, `robots.txt`).
Pour le prévisualiser : `npm run preview` puis http://localhost:4173.

## Tests

```bash
npm test              # tests unitaires (Vitest)
npm run typecheck     # vérification TypeScript
npm run lint          # ESLint (dont règles d'accessibilité)
npm run test:e2e      # tests navigateur Playwright (construit et lance le site automatiquement)
```

État actuel : 170 tests unitaires, 115 tests navigateur sur 5 écrans (320, 375, 390 px, tablette,
ordinateur) et 24 audits d'accessibilité axe-core, tous au vert. Détails :
[qualite/RAPPORT_TESTS.md](qualite/RAPPORT_TESTS.md).

## Utiliser l'application

1. Ouvrir **Créer mon catalogue**.
2. **Boutique** : saisir au moins le nom (ou « Utiliser des données d'exemple »).
3. **Produits** : « Ajouter un produit » (photo, nom, prix…), ou « Ajouter plusieurs photos » puis
   compléter les noms et prix, ou « Charger une boutique exemple ».
4. **Modèle** : choisir un modèle, le format, la taille des produits et les options ; l'aperçu se met à
   jour en direct.
5. **Aperçu** : vérifier chaque page ; « Recommencer » efface tout (avec confirmation).
6. **Télécharger** : « Créer mon PDF », puis « Télécharger le PDF » ou « Partager le PDF ».
7. Sur WhatsApp : trombone → Document → choisir le fichier PDF.

## Générer un catalogue de démonstration

- Dans l'outil : étape 2 → « Charger une boutique exemple », ou depuis la page **Exemples**.
- En ligne de commande (PDF de `marketing/demos/`) : `npm run build && npm run preview`, puis dans un
  autre terminal `npm run demo:pdf`.

## Autres scripts

| Commande | Rôle |
|---|---|
| `npm run previews` | Régénère les aperçus SVG du site (`public/apercus/`) — automatique au build |
| `npm run brand:assets` | Régénère icônes PNG et image Open Graph (`public/`) |
| `npm run fonts:metrics` | Régénère les métriques des polices PDF (`src/pdf/fontMetrics.ts`) |

## Configuration

Copier `.env.example` en `.env.local` et renseigner les variables **publiques** (URL du site, e-mail de
contact, réseaux sociaux). Aucune variable secrète n'est nécessaire. Voir [SECURITY.md](SECURITY.md).

## Limites connues

- Polices PDF standard (Helvetica, Times) : les émojis et les alphabets non latins sont retirés du PDF
  (l'utilisateur est prévenu).
- Format HEIC (iPhone) non pris en charge par tous les navigateurs : message explicatif.
- Données locales liées au navigateur et à l'appareil : pas de synchronisation entre appareils.
- Pas de mode hors-ligne (service worker) en V1.
- Le déblocage Premium n'existe pas encore : aucun paiement n'est possible.

Détails : [qualite/LIMITES_ET_RISQUES.md](qualite/LIMITES_ET_RISQUES.md).

## Documentation

[PLAN](PLAN.md) · [PROGRESS](PROGRESS.md) · [DECISIONS](DECISIONS.md) ·
[STRUCTURE_PROJET](STRUCTURE_PROJET.md) · [SECURITY](SECURITY.md) ·
[DEPLOYMENT_GUIDE](DEPLOYMENT_GUIDE.md) · [TODO_VALIDATION_HUMAINE](TODO_VALIDATION_HUMAINE.md) ·
[RAPPORT_FINAL](RAPPORT_FINAL.md) · dossiers [branding/](branding/), [marketing/](marketing/),
[docs/](docs/), [qualite/](qualite/).
