# Check-list qualité

État au 1er octobre 2026. ✅ vérifié · ⚠️ partiel / à valider · ⏳ à faire plus tard

## Fonctionnel

- ✅ Parcours en 5 étapes avec barre de progression, retour arrière sans perte de travail.
- ✅ Formulaire boutique complet, données d'exemple, devise (USD, CDF, EUR, FCFA, personnalisée), couleur, logo.
- ✅ Produits : ajout, modification, duplication, suppression avec annulation, monter/descendre, tri, filtre.
- ✅ Ajout de plusieurs photos d'un coup, 50 produits testés, limite technique de 200.
- ✅ Validations : nom et prix obligatoires, prix invalide, ancien prix incohérent, formats et tailles de photos.
- ✅ 4 boutiques exemples (≥ 12 produits chacune) ; ouverture depuis la page Exemples.
- ✅ 4 modèles distincts, A4 portrait et paysage, 3 densités, options d'affichage.
- ✅ Aperçu fidèle, nombre de pages, nom du fichier, « Recommencer » avec confirmation.
- ✅ Export PDF : progression, succès, erreur, téléchargement, partage natif, nom de fichier propre.
- ✅ Premium présenté honnêtement, aucun paiement, aucun faux déblocage.
- ✅ Sauvegarde locale avec information, désactivation et effacement ; sauvegarde immédiate si la page est masquée.

## Contenu et conformité

- ✅ Interface entièrement en français, sans jargon.
- ✅ Mention de confidentialité exacte affichée (accueil, outil, FAQ, politique).
- ✅ Pages légales avec la mention « modèle informatif à relire… ».
- ✅ Aucun faux avis, faux chiffre, faux logo client ; emplacement d'avis marqué.
- ✅ Aucun compte social ou e-mail inventé (configurables, masqués si vides).
- ⚠️ Pages légales à compléter et faire relire (éléments entre crochets).
- ⚠️ Orthographe : relue ; une relecture humaine finale reste recommandée.

## Technique

- ✅ TypeScript strict, 0 erreur ; ESLint 0 erreur ; code formaté (Prettier).
- ✅ 170 tests unitaires ; 115 tests navigateur + 24 audits d'accessibilité (Edge, 5 écrans).
- ✅ Build de production + pré-rendu + sitemap + robots + 404.
- ✅ Aucune clé, aucun secret, aucun script tiers.
- ✅ Dépendances : `npm audit` sans vulnérabilité connue à l'installation.

## Accessibilité (détail : AUDIT_ACCESSIBILITE.md)

- ✅ axe-core WCAG 2.1 AA : 0 violation (site + outil, ordinateur + téléphone).
- ✅ Clavier, focus visible, lien d'évitement, fenêtres modales natives, annonces `aria-live`.
- ⚠️ PDF non balisé (limite de jsPDF).

## Performance (détail : AUDIT_PERFORMANCE.md)

- ✅ Pages pré-rendues, polices système, code chargé à la demande, aperçus en SVG différés.
- ✅ Accueil : 139 Ko transférés, premier affichage 1,8 s en 4G lente simulée avec processeur ×4.
- ✅ PDF de 50 produits : 235 Ko.
- ⏳ Mode hors-ligne (service worker).

## Mobile (détail : TESTS_MOBILE.md)

- ✅ 320, 375, 390 px, tablette, ordinateur : aucun défilement horizontal.
- ⚠️ À confirmer sur de vrais téléphones Android d'entrée de gamme et sur iPhone.
