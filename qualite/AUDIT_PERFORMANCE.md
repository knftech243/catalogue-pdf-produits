# Audit de performance

Mesures du 1er octobre 2026 sur le build de production (`npm run build`), servi localement
(`vite preview`, compression activée), dans Microsoft Edge piloté par Playwright.

## Poids et temps de chargement (téléphone 390 px)

| Page | Requêtes | Transféré | Premier affichage (4G lente + processeur ×4) | Chargement complet (idem) |
|---|---|---|---|---|
| Accueil `/` | 7 | 139 Ko | 1,8 s | 2,9 s |
| Exemples `/exemples` | 8 | 128 Ko | 1,0 s | 2,4 s |
| Outil `/creer` | 7 | 149 Ko | 0,8 s | 2,2 s |

« 4G lente » simulée : 1,6 Mbit/s, 150 ms de latence ; processeur ralenti 4 fois (téléphone d'entrée
de gamme). Sans ralentissement : chargement de l'accueil en 0,7 s.

## Génération du PDF

| Cas | Ordinateur | Processeur ×4 |
|---|---|---|
| Épicerie, 14 produits, photos | 1,5 s | 3,0 s |

Poids des PDF : 86 à 142 Ko pour 13 à 14 produits, **235 Ko pour 50 produits avec photos**.

## Fichiers JavaScript (minifiés ; gzip estimé)

| Fichier | Taille | Chargé quand |
|---|---|---|
| `index-*.js` (React + site) | 300 Ko (~94 Ko gzip) | Toutes les pages |
| `CreatorPage-*.js` (outil + moteur de mise en page) | 129 Ko (~39 Ko gzip) | Ouverture de l'outil |
| `jspdf.es.min-*.js` | 390 Ko (~130 Ko gzip) | Seulement au clic sur « Créer mon PDF » |
| `export-*.js` | 6 Ko | Au clic sur « Créer mon PDF » |
| `html2canvas`, `purify`, `index.es` | — | **Jamais** (dépendances facultatives de jsPDF, non utilisées) |
| CSS du site / de l'outil | 20 Ko / 15 Ko (~5,5 / ~3,8 Ko gzip) | Pages / outil |

React DOM représente à lui seul environ 60 Ko gzip du fichier principal : c'est le socle incompressible
de la stack choisie.

## Optimisations en place

- **Pré-rendu HTML** de chaque page : contenu visible avant l'exécution du JavaScript.
- **Polices système** : aucun téléchargement de police.
- **Découpage du code** : l'outil (et son moteur de mise en page) puis jsPDF ne sont chargés qu'au
  moment où ils servent. Le moteur PDF a été retiré du fichier principal pendant l'audit (-21 Ko gzip) :
  les aperçus du site sont désormais des images SVG statiques générées au build.
- **Chargement différé** (`loading="lazy"`) des aperçus de catalogues sous la ligne de flottaison ;
  les deux aperçus du haut de l'accueil sont prioritaires (`fetchpriority="high"`).
- **Aucune image lourde** sur le site : illustrations vectorielles (aperçus de 8 à 30 Ko).
- **Photos optimisées localement** : réduites à 1600 px max, miniatures de 480 px pour l'écran (moins
  de mémoire sur Android), photos composées à la taille exacte de leur cadre dans le PDF (150 dpi).
- **Traitement photo par photo** pendant l'export (mémoire maîtrisée), images identiques intégrées
  une seule fois dans le PDF.
- **Aperçus longs** : `content-visibility: auto` sur les pages hors écran.
- Fichiers versionnés par empreinte (`assets/*-hash.js`) : cache long possible (voir DEPLOYMENT_GUIDE.md).

## Pistes d'amélioration

- Service worker (mode hors-ligne et chargement instantané au 2e passage) — reporté (DECISIONS D17).
- Remplacer React par Preact compat (-~45 Ko gzip) si le poids initial devient un frein mesuré.
- Mesurer sur le terrain (Core Web Vitals) après la mise en ligne.
