# Tests mobile et responsive

Outil : Playwright avec Microsoft Edge, émulation d'appareils tactiles Android (densité ×2, agent
utilisateur Android Chrome). Les captures de contrôle sont produites à chaque exécution dans
`test-results/` (non versionné).

| Écran | Taille | Pages du site | Outil (validations) | Parcours avec photos + PDF | Stockage local | Débordement horizontal |
|---|---|---|---|---|---|---|
| Téléphone 320 | 320 × 640 | ✅ 11 pages | ✅ | ✅ | — | ✅ aucun |
| Téléphone 375 | 375 × 812 | ✅ 11 pages | ✅ | ✅ | — | ✅ aucun |
| Téléphone 390 | 390 × 844 | ✅ 11 pages | ✅ | — | ✅ | ✅ aucun |
| Tablette | 768 × 1024 | ✅ 11 pages | ✅ | — | — | ✅ aucun |
| Ordinateur | 1366 × 900 | ✅ 11 pages | ✅ | ✅ | ✅ | ✅ aucun |

Pour chaque écran, les 5 étapes de l'outil (boutique, produits, modèle, aperçu, téléchargement) sont
ouvertes avec une boutique exemple et vérifiées sans défilement horizontal.

## Ce qui est adapté au téléphone

- Navigation de l'outil fixée en bas de l'écran (« Retour » / « Suivant »), à portée du pouce.
- Barre de progression compacte : « Étape 2 sur 5 — Produits » + pastilles numérotées.
- Fenêtre d'ajout de produit en plein écran, boutons sur toute la largeur.
- Champs de 48 px de haut minimum, police 16 px (pas de zoom automatique), clavier numérique pour les
  prix (`inputmode="decimal"`) et téléphoniques pour les numéros.
- Bouton photo : le téléphone propose l'appareil photo ou la galerie.
- Actions de chaque produit (monter, descendre, dupliquer, supprimer) en grands boutons sous la fiche.
- Menu principal replié sous 820 px, fermé automatiquement après une navigation ou avec Échap.
- Filtres de catégorie en ligne défilante.

## Défaut trouvé et corrigé

Un nom de produit très long élargissait la liste des produits au-delà de l'écran (320 et 375 px), ce
qui empêchait de toucher les boutons d'action. Correction : grilles en `minmax(0, 1fr)`. Une
vérification automatique de l'absence de défilement horizontal a été ajoutée juste après l'ajout de ce
produit.

## À vérifier sur de vrais appareils (non automatisable ici)

- Android d'entrée de gamme (2 à 3 Go de mémoire) avec 50 photos de 12 mégapixels.
- Choix de l'appareil photo depuis le bouton d'import (Android, iPhone).
- Feuille de partage « Partager le PDF » vers WhatsApp.
- Ouverture du PDF reçu dans WhatsApp chez le client, clic sur les liens.
- Safari iOS (téléchargement d'un fichier généré : comportement différent d'Android).

Voir [CHECKLIST_AVANT_LANCEMENT.md](CHECKLIST_AVANT_LANCEMENT.md).
