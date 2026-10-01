# Structure du projet

```
catalogue-pdf-produits/
├── index.html                  Gabarit HTML (marqueurs de pré-rendu <!--head-start/end-->, <!--app-html-->)
├── public/                     Fichiers servis tels quels
│   ├── apercus/                Aperçus SVG des catalogues de démonstration (générés : npm run previews)
│   ├── favicon.svg, favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png
│   ├── og-image.png            Image de partage (Open Graph) 1200 × 630
│   └── manifest.webmanifest
├── src/
│   ├── entry-client.tsx        Démarrage navigateur (hydratation si le HTML pré-rendu correspond)
│   ├── entry-server.tsx        Rendu serveur utilisé uniquement au build (pré-rendu)
│   ├── App.tsx                 Mise en page générale + table des pages (outil chargé à la demande)
│   ├── routes.ts               Pages, titres, descriptions (routeur, pré-rendu, sitemap)
│   ├── router/router.tsx       Routeur léger (History API) et composant Link
│   ├── seo/head.ts             Balises <head> : title, description, canonique, Open Graph, JSON-LD
│   ├── config/
│   │   ├── site.ts             Variables publiques (URL, contact, réseaux) + textes obligatoires
│   │   └── plans.ts            Offres gratuit / Premium (Premium inactif)
│   ├── content/faq.ts          Questions fréquentes
│   ├── core/                   Logique métier sans interface
│   │   ├── types.ts            Modèle de données (boutique, produits, réglages)
│   │   ├── defaults.ts         Valeurs par défaut, limites, identifiants
│   │   ├── price.ts            Lecture et formatage des prix, devises
│   │   ├── text.ts             Nom de fichier, liens WhatsApp, réseaux sociaux, dates
│   │   └── color.ts            Contrastes et couleurs lisibles
│   ├── pdf/                    Moteur de catalogue
│   │   ├── fontMetrics.ts      Largeurs AFM des polices PDF (généré : npm run fonts:metrics)
│   │   ├── measure.ts          Mesure, nettoyage et découpage du texte
│   │   ├── prepare.ts          Tri, filtrage, limites, nettoyage des données
│   │   ├── layout/             Mise en page → liste d'opérations de dessin
│   │   │   ├── types.ts        Opérations (rect, texte, image, lien…)
│   │   │   ├── meta.ts         Descriptions et grilles des modèles (léger, utilisé par le site)
│   │   │   ├── kit.ts          Briques communes (pagination, contacts, prix, filigrane…)
│   │   │   ├── index.ts        Registre des modèles, layoutCatalog()
│   │   │   └── templates/      minimal.ts, fashion.ts, beauty.ts, food.ts
│   │   ├── preview/SvgPage.tsx Rendu SVG d'une page (aperçu)
│   │   ├── render/renderPdf.ts Rendu jsPDF (utilisable dans Node pour les tests)
│   │   └── export.ts           Génération complète dans le navigateur (photos → PDF → Blob)
│   ├── creator/                Outil « Créer mon catalogue » (chargé à la demande)
│   │   ├── CreatorPage.tsx     Étapes, navigation, exemples, annonces accessibles
│   │   ├── state.tsx           État (réducteur), photos en mémoire, sauvegarde automatique
│   │   ├── storage.ts          localStorage (textes) + IndexedDB (photos)
│   │   ├── imageProcessing.ts  Vérification, redimensionnement, compression des photos
│   │   ├── Step*.tsx           Les 5 étapes
│   │   ├── ProductEditor.tsx   Fenêtre d'ajout / modification d'un produit
│   │   ├── DataPanel.tsx       « Données sur cet appareil » (sauvegarde, effacement)
│   │   └── …                   Champs, sélecteur de couleur, chargement des exemples
│   ├── demo/                   Boutiques fictives, illustrations SVG, rendu des aperçus
│   ├── components/             En-tête, pied de page, logo, icônes, fenêtres, FAQ, aperçus
│   ├── pages/                  Pages du site (accueil, modèles, exemples, tarifs, FAQ, contact, légal, 404)
│   └── styles/                 base.css (jetons, boutons, formulaires), site.css, creator.css
├── scripts/
│   ├── prerender.mjs           Pré-rendu des pages + 404 + sitemap.xml + robots.txt (au build)
│   ├── generate-previews.mjs   Aperçus SVG du site (au build)
│   ├── generate-brand-assets.mjs  Icônes PNG + image Open Graph
│   ├── generate-marketing-assets.mjs  Démonstrations de marketing/demos (PDF réels via Edge)
│   ├── generate-font-metrics.mjs  Métriques des polices PDF
│   └── qa-snap.mjs             Capture d'écran de contrôle (Edge)
├── qa/pdf-viewer.html          Visionneuse PDF de contrôle qualité (développement uniquement, non publiée)
├── tests/
│   ├── unit/                   Vitest : prix, textes, mesure, mise en page, PDF réel
│   └── e2e/                    Playwright : parcours complets, mobile/tablette/ordinateur
├── branding/                   Noms de marque, identité visuelle, logos SVG
├── marketing/                  Contenus réseaux sociaux, scripts vidéo, légendes, SEO, démonstrations
├── docs/                       Stratégie Premium, guide d'intégration du paiement
├── qualite/                    Check-lists, rapports de tests, audits, limites et risques
└── *.md                        README, PLAN, PROGRESS, DECISIONS, SECURITY, DEPLOYMENT_GUIDE,
                                TODO_VALIDATION_HUMAINE, RAPPORT_FINAL
```

## Flux de données

```
Saisie (formulaires) ──► état React (state.tsx) ──► sauvegarde locale (storage.ts)
                                   │
                                   ▼
                   prepare.ts (tri, filtre, nettoyage du texte)
                                   │
                                   ▼
              layout/templates/*.ts ──► opérations de dessin (pages)
                     │                              │
                     ▼                              ▼
          preview/SvgPage.tsx (écran)     render/renderPdf.ts + export.ts (PDF)
```
