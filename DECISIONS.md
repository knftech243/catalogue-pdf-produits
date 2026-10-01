# DECISIONS — Catalogue Express

Journal des décisions produit et techniques. Chaque décision indique le contexte, le choix et
la raison. Les décisions marquées **[À valider]** sont reprises dans
[TODO_VALIDATION_HUMAINE.md](TODO_VALIDATION_HUMAINE.md).

---

## D01 — Stack : React 19 + TypeScript + Vite
- **Choix** : React + TypeScript + Vite, CSS moderne sans framework CSS.
- **Pourquoi** : stack demandée, écosystème mature, build statique rapide, typage strict.
  Pas de Tailwind ni de bibliothèque de composants pour garder un bundle léger et un CSS lisible.

## D02 — Génération PDF : moteur de mise en page maison + jsPDF (et non html2canvas)
- **Contexte** : html2canvas « photographie » le HTML : texte transformé en image, rendu flou,
  fichiers lourds, résultats différents selon les téléphones.
- **Choix** : un moteur de mise en page pur TypeScript calcule des opérations de dessin
  (rectangles, textes, images, liens). Ces opérations sont rendues :
  - en **SVG** pour l'aperçu à l'écran ;
  - avec **jsPDF** pour le fichier final (texte vectoriel net, sélectionnable).
- **Pourquoi** : aperçu fidèle au PDF, texte net, PDF léger, pagination maîtrisée,
  aucun texte coupé (retour à la ligne et points de suspension calculés).
- **Conséquence** : jsPDF n'est chargé qu'au moment de l'export (chargement différé).

## D03 — Polices du PDF : polices standard PDF (Helvetica, Times)
- **Choix** : polices standard intégrées aux lecteurs PDF (Helvetica, Times), aucune police embarquée.
- **Pourquoi** : 0 Ko ajouté au PDF, accents français pris en charge (encodage WinAnsi).
- **Limite** : les caractères hors alphabet latin (emoji, symbole ₦, etc.) ne peuvent pas être
  affichés ; ils sont retirés ou remplacés automatiquement (ex. espace fine insécable → espace).
  Documenté dans `qualite/LIMITES_ET_RISQUES.md`.
- Les métriques de largeur des caractères sont extraites de jsPDF par un script
  (`scripts/generate-font-metrics.mjs`) pour que l'aperçu utilise exactement les mêmes calculs.

## D04 — Photos : recadrage pré-calculé sur canvas
- À l'ajout : chaque photo est redimensionnée localement (≤ 1600 px, JPEG) + une miniature (≤ 480 px)
  pour l'affichage (économie de mémoire sur Android).
- À l'export : chaque photo est composée sur un canvas aux proportions exactes de son emplacement
  (mode « Remplir » = recadrage centré ; mode « Photo entière » = photo complète sur fond neutre),
  puis intégrée en JPEG ~150 dpi. Aucune image n'est jamais étirée.

## D05 — Stockage local : localStorage (texte) + IndexedDB (photos)
- **Contexte** : le cahier des charges autorise localStorage « si utile ». localStorage est limité
  à ~5 Mo et ne peut pas contenir 50 photos.
- **Choix** : textes et réglages dans `localStorage`, photos dans `IndexedDB` (toujours dans le
  navigateur, jamais envoyées). Sauvegarde automatique **activée par défaut** avec un bandeau
  d'information, **désactivable**, et un bouton « Effacer mes données locales ».
- **Pourquoi** : sur téléphone, un rechargement accidentel ferait perdre tout le travail.
  **[À valider]** : choix par défaut « activé ».

## D06 — Routeur maison + pré-rendu statique
- **Choix** : petit routeur basé sur l'History API (pas de dépendance) ; les pages sont
  pré-rendues en HTML au build (`scripts/prerender.mjs`) avec titre, description, Open Graph,
  URL canonique propres à chaque page.
- **Pourquoi** : SEO correct sans serveur, premier affichage rapide sur connexion faible.
  L'outil de création (lourd) est chargé à la demande.

## D07 — Premium : interface prête, aucun paiement
- `src/config/plans.ts` décrit les droits « gratuit » et « premium ». En V1, **tout le monde est
  en gratuit** : export de démonstration avec mention « Démo » discrète, jusqu'à 50 produits
  par export, résolution standard.
- Le bouton « Débloquer l'export complet » ouvre une fenêtre qui explique honnêtement que le
  paiement n'est pas encore disponible. Aucun faux paiement, aucun faux déblocage.
- Les prix (3 $, 5 $, 7 $) ne sont **pas affichés** publiquement : ce sont des hypothèses internes
  (voir `docs/PREMIUM_STRATEGY.md`). La page Tarifs indique « tarif annoncé au lancement ».

## D08 — Devise et format des prix
- Devise par défaut : USD. Choix : USD, CDF, EUR, FCFA, symbole personnalisé (avant/après le prix).
- Format français : séparateur de milliers = espace, décimales avec virgule, décimales affichées
  seulement si le prix n'est pas entier (ex. `25 $`, `12,50 $`, `25 000 FC`, `5 000 FCFA`).
- Saisie tolérante : `12,5`, `12.50`, `25 000` sont acceptés.
- Symbole CDF affiché : `FC` (usage courant en RDC).

## D09 — Réorganisation : boutons Monter / Descendre (pas de glisser-déposer)
- Le glisser-déposer tactile est peu fiable sur Android bas de gamme et difficile d'accès au
  clavier. Les boutons sont stables, accessibles et suffisants. Le tri (nom, prix) est un
  réglage d'affichage qui ne détruit pas l'ordre manuel.

## D10 — Liens WhatsApp cliquables dans le PDF
- Si un numéro WhatsApp au format international est fourni, le PDF contient des liens
  `https://wa.me/...` (couverture, pied de page et chaque produit avec un message pré-rempli).
- Ce n'est **pas** une connexion à WhatsApp : c'est un simple lien dans le document, ouvert par
  le client qui lit le catalogue. Option désactivable.

## D11 — Partage : feuille de partage du téléphone (Web Share API)
- Sur les téléphones compatibles, un bouton « Partager le PDF » ouvre la feuille de partage du
  système (l'utilisateur choisit lui-même WhatsApp, e-mail…). Sinon, téléchargement classique.
  Aucune intégration directe avec WhatsApp.

## D12 — Visuels de démonstration générés localement (SVG)
- Les produits de démonstration utilisent des illustrations vectorielles dessinées dans le code
  (`src/demo/illustrations.ts`) : aucune photo sous licence, aucun téléchargement externe,
  poids quasi nul. Elles sont converties en JPEG dans le navigateur au chargement d'un exemple.

## D13 — Polices du site : polices système
- Aucune police web téléchargée : `system-ui` (Roboto sur Android, Segoe UI sur Windows,
  San Francisco sur iOS). Gain de performance sur connexion faible.

## D14 — Contact et réseaux sociaux configurables
- Aucune adresse e-mail ni compte social n'est inventé. Ils se configurent via variables
  d'environnement publiques (`.env.example`). S'ils sont vides, les liens ne s'affichent pas et
  le formulaire de contact indique que l'adresse sera publiée prochainement. **[À valider]**

## D15 — Tests : Vitest (unitaires) + Playwright avec le navigateur Edge/Chrome installé
- Vitest pour le moteur de mise en page, les prix, les noms de fichiers, la génération PDF (Node).
- Playwright en utilisant le navigateur **déjà installé** sur la machine (canal `msedge`) :
  aucun téléchargement de navigateur. Sert aux tests E2E (mobile 320/375/390, tablette,
  ordinateur, export PDF réel) et à la génération des PDF de démonstration du dossier `marketing/`.

## D16 — Limite gratuite de 50 produits par export
- Le cahier des charges exige le bon fonctionnement avec 50 produits : la limite gratuite est
  fixée à 50 (configurable). L'éditeur accepte jusqu'à 200 produits ; au-delà de 50, l'export
  de démonstration prévient clairement que seuls les 50 premiers sont inclus. **[À valider]**

## D17 — Pas de service worker (hors-ligne) en V1
- Un service worker mal configuré peut servir une version obsolète et compliquer le support.
  Reporté après le lancement (voir `qualite/LIMITES_ET_RISQUES.md`).

## D18 — Envoi du code sur GitHub
- Le cahier des charges demande à la fois de ne rien pousser sans autorisation explicite et
  (section 14) de pousser le code sur `https://github.com/knftech243/catalogue-pdf-produits.git`.
  La demande de la section 14 est considérée comme l'autorisation explicite : le dépôt existant
  (vide) est utilisé comme `origin`, **aucun dépôt n'est créé**.

## D19 — Aperçus du site en SVG statiques (performance)
- **Contexte** : afficher les aperçus de catalogues sur l'accueil obligeait à charger tout le moteur de
  mise en page (+21 Ko gzip sur chaque page).
- **Choix** : les aperçus sont générés au build (`scripts/generate-previews.mjs`) en fichiers SVG
  (`public/apercus/`), chargés en différé. Le moteur n'est plus chargé que dans l'outil.

## D20 — Hydratation conditionnelle (`data-route`)
- Le HTML pré-rendu porte l'adresse pour laquelle il a été produit. Si un hébergeur sert une autre page
  (redirection générique vers `index.html`), le navigateur reconstruit la bonne page au lieu de
  l'hydrater : pas d'erreur, même avec un hébergement mal configuré.
- L'outil de création n'est jamais rendu au pré-rendu (écran de chargement identique côté serveur et
  navigateur) : supprime l'erreur React #419.

## D21 — Sauvegarde immédiate quand la page est masquée
- Défaut trouvé en test : une saisie faite moins de 0,4 s avant un rechargement était perdue.
- La sauvegarde automatique est forcée sur `pagehide` et `visibilitychange` (changement d'application
  sur Android, fermeture d'onglet).

## D22 — Orange foncé pour le texte
- L'orange de marque `#FF7A1A` en texte n'atteint que 2,6:1 de contraste. Tout texte orange utilise
  `#C2410C` (≈ 5:1). L'orange vif reste pour les aplats (boutons, pictogramme) et les fichiers du logo.

## D23 — Audit d'accessibilité automatisé (axe-core)
- `@axe-core/playwright` (dépendance de développement) audite le site et l'outil à chaque exécution des
  tests navigateur (WCAG 2.1 A/AA). Seuil : 0 violation.

## D24 — Règles ESLint `react-hooks` 7 respectées
- Les mises à jour d'état dans des effets ont été remplacées par des valeurs dérivées (filtre de
  catégorie, statut d'export, statut de sauvegarde) ou par une recréation du composant (`key`) pour la
  fenêtre produit. Une seule exception documentée : la lecture unique du paramètre `?exemple=`.
