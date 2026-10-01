# Rapport de tests

Date : 1er octobre 2026 · Version testée : build de production (`npm run build`, pages pré-rendues).

## Synthèse

| Type de test | Outil | Résultat |
|---|---|---|
| Vérification des types | `tsc -b` | ✅ 0 erreur |
| Qualité du code + accessibilité statique | ESLint 9 (+ jsx-a11y, react-hooks 7) | ✅ 0 erreur, 4 avertissements sans impact (rechargement à chaud en développement) |
| Tests unitaires | Vitest 5 | ✅ **170 / 170** réussis |
| Tests navigateur | Playwright + **Microsoft Edge** installé, 5 écrans | ✅ **115 réussis**, 0 échec, 45 ignorés volontairement* |
| Audit d'accessibilité | axe-core 4.13 (WCAG 2.1 A/AA) dans Edge | ✅ **24 / 24** analyses sans violation |
| Dépendances | `npm audit` | ✅ 0 vulnérabilité connue |
| PDF réels de démonstration | Script `npm run demo:pdf` (parcours complet dans Edge) | ✅ 4 PDF générés et vérifiés visuellement |

\* Les tests longs (photo lourde, 50 produits, export de chaque modèle) ne sont lancés que sur
l'écran « ordinateur » ; le parcours complet avec photos sur ordinateur + 320 px + 375 px ; le stockage
local sur ordinateur + 390 px. Les validations, la navigation et les captures tournent sur les 5 écrans.

Écrans testés : ordinateur 1366 × 900, tablette 768 × 1024, téléphones Android émulés 320 × 640,
375 × 812 et 390 × 844 (écran tactile, densité ×2, agent utilisateur Android).

## Les 30 scénarios du cahier des charges

| # | Scénario | Résultat | Où / comment |
|---|---|---|---|
| 1 | Aucun produit | ✅ | E2E : message « Ajoutez au moins un produit pour continuer. », passage bloqué (5 écrans) ; unitaire : couverture seule |
| 2 | Un produit | ✅ | Unitaire (pagination, PDF réel) + E2E |
| 3 | Cinq produits | ✅ | Unitaire (4 modèles × 2 orientations) + PDF réel |
| 4 | Vingt produits | ✅ | Unitaire (pas de texte hors page, pas de chevauchement, numérotation) + PDF réel × 8 |
| 5 | Cinquante produits | ✅ | E2E : 50 photos importées d'un coup, filtre, export PDF de 7 pages (235 Ko) ; unitaire : 3 densités × 4 modèles × 2 orientations |
| 6 | Produit sans photo | ✅ | Emplacement « Photo à venir » (unitaire + E2E) |
| 7 | Photo carrée | ✅ | E2E (800 × 800) |
| 8 | Photo verticale | ✅ | E2E (600 × 1200) |
| 9 | Photo horizontale | ✅ | E2E (1400 × 600) ; recadrage sans déformation (aperçu + PDF) |
| 10 | Photo lourde | ✅ | E2E : photo de 12 mégapixels (> 2 Mo) réduite à ≤ 1600 px, fichier conservé plus léger |
| 11 | Nom de produit long | ✅ | Unitaire (retour à la ligne + « … ») + E2E (aucun défilement horizontal) |
| 12 | Description longue | ✅ | Unitaire : texte coupé proprement par « … », jamais de débordement |
| 13 | Prix avec décimales | ✅ | Unitaire (`12,5`, `12.50`, `1 250,75`…) + E2E (`12,50 $`, `8,49 $`) |
| 14 | Changement de devise | ✅ | E2E : USD → CDF (`8,49 FC`) ; unitaire : USD, CDF, EUR, FCFA, symbole personnalisé avant/après |
| 15 | Ajout d'un logo | ✅ | E2E (PNG) + unitaire (logo présent sur la couverture des 4 modèles) |
| 16 | Aucun logo | ✅ | Unitaire (4 modèles) |
| 17 | Suppression de produit | ✅ | E2E avec « Annuler » puis suppression définitive |
| 18 | Duplication de produit | ✅ | E2E (« Produit carré (copie) » inséré juste après) |
| 19 | Réorganisation | ✅ | E2E (bouton « Descendre », ordre vérifié) ; tri par nom/prix sans perte de l'ordre manuel (unitaire) |
| 20 | Chaque modèle | ✅ | E2E : sélection, aperçu en direct et export PDF des 4 modèles |
| 21 | A4 portrait | ✅ | PDF 595 × 842 pt vérifié (4 modèles) |
| 22 | A4 paysage | ✅ | PDF 842 × 595 pt vérifié, nombre de pages = aperçu (4 modèles) |
| 23 | Écran 320 px | ✅ | Toutes les pages + parcours complet avec photos + export ; aucun défilement horizontal |
| 24 | Écran 375 px | ✅ | Idem |
| 25 | Écran 390 px | ✅ | Pages + stockage local + captures |
| 26 | Tablette | ✅ | Pages, menu replié, outil, captures |
| 27 | Ordinateur | ✅ | Ensemble des scénarios |
| 28 | Génération PDF | ✅ | 12 PDF générés dans Edge pendant les tests + 4 démos + 12 PDF générés dans Node (unitaires) |
| 29 | Téléchargement PDF | ✅ | Téléchargement réel, nom `catalogue-boutique-elegance-test-AAAA-MM-JJ.pdf`, en-tête `%PDF-`, relu par pdf-lib |
| 30 | Effacement du stockage local | ✅ | E2E : sauvegarde, rechargement, effacement avec confirmation, rechargement → vide |

Autres vérifications automatisées : un seul H1 par page, titre et description, balise Open Graph,
textes alternatifs, boutons nommés, absence d'erreur console, lien d'évitement au clavier, menu
mobile, page 404 avec statut 404, tous les liens internes, sitemap/robots/manifeste, chargement différé
des aperçus, mention légale obligatoire, offre Premium honnête (aucun champ de paiement), confirmation
avant « Recommencer », messages d'erreur pour fichiers invalides (texte, HEIC, fichier abîmé, > 25 Mo).

## Problèmes trouvés et corrigés pendant les tests

| Problème | Impact | Correction |
|---|---|---|
| Une modification faite moins de 0,4 s avant un rechargement ou un changement d'application était perdue | Perte de la dernière saisie (prix, devise, orientation) sur téléphone | Sauvegarde immédiate sur `pagehide` et `visibilitychange` (`src/creator/state.tsx`) |
| Erreur React #419 à l'ouverture de `/creer` (outil chargé à la demande rendu côté serveur) | Message d'erreur en console, rendu refait côté navigateur | L'outil n'est plus rendu au pré-rendu : écran de chargement identique serveur/navigateur (`src/App.tsx`) |
| Un nom de produit très long élargissait la liste sur téléphone | Défilement horizontal, boutons difficiles à atteindre | Grilles en `minmax(0, 1fr)` (`src/styles/creator.css`) |
| `vite preview` renvoyait l'accueil pour `/faq` et pour les pages inconnues | Hydratation incorrecte, statut 200 au lieu de 404 | Serveur local fidèle à un hébergeur statique + vérification `data-route` avant hydratation |
| Miniatures des modèles : « 12 produits » au lieu de 13 | Texte de couverture faux dans les vignettes | Même limite que l'export (`StepTemplate.tsx`) |
| Vignettes des modèles sur 2 lignes en tablette | Beaucoup de défilement | 4 colonnes dès 600 px |
| Intertitre de catégorie tronqué (« PIZZ… ») | Texte coupé | Tolérance d'arrondi dans la mesure du texte |
| Catégorie répétée dans chaque fiche quand les produits sont regroupés | Redondance | Catégorie masquée sur les fiches en mode regroupé |
| Ancien prix masqué par la pastille de disponibilité (Cosmétiques) | Promotion invisible | L'ancien prix est prioritaire |
| Couverture « Restauration » : photos mal centrées | Mise en page déséquilibrée | Choix automatique de la grille donnant les plus grandes photos, centrée |

Aucun problème connu non corrigé n'empêche l'utilisation. Les limites restantes sont décrites dans
[LIMITES_ET_RISQUES.md](LIMITES_ET_RISQUES.md).

## Rejouer les tests

```bash
npm run typecheck
npm run lint
npm test
npm run test:e2e        # construit le site, lance vite preview, utilise Edge
PW_CHANNEL=chrome npm run test:e2e   # variante avec Google Chrome
```

Rapport HTML détaillé : `playwright-report/index.html` (généré localement, non versionné).
