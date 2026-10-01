# Tests de l'export PDF

## Méthode

1. **Moteur de mise en page (Vitest, Node)** : pour chaque modèle × orientation × densité, avec 1, 5,
   20 et 50 produits : nombre de pages, aucun texte hors de la page, aucune fiche qui en chevauche une
   autre, numérotation « n / total », intertitres de catégorie, textes longs raccourcis par « … »,
   devise, filigrane, absence de photo/logo/contacts, liens WhatsApp.
2. **PDF réel dans Node** : rendu jsPDF de 12 catalogues, relus avec pdf-lib (nombre de pages,
   format A4, liens cliquables, taille du fichier).
3. **PDF réel dans le navigateur (Edge)** : parcours utilisateur complet, clic sur « Créer mon PDF »,
   téléchargement réel, relecture avec pdf-lib.
4. **Contrôle visuel** : pages rasterisées avec pdf.js (`qa/pdf-viewer.html`) et inspectées.

## Résultats des PDF générés dans Edge (photos réelles optimisées dans le navigateur)

| Catalogue | Modèle | Format | Pages | Poids |
|---|---|---|---|---|
| Épicerie, 14 produits | Minimal clair | A4 portrait | 3 | 115 Ko |
| Épicerie, 14 produits | Minimal clair | A4 paysage | 3 | 110 Ko |
| Vêtements, 13 produits | Mode élégante | A4 portrait | 4 | 142 Ko |
| Vêtements, 13 produits | Mode élégante | A4 paysage | 3 | 97 Ko |
| Cosmétiques, 13 produits | Cosmétiques moderne | A4 portrait | 3 | 90 Ko |
| Cosmétiques, 13 produits | Cosmétiques moderne | A4 paysage | 3 | 86 Ko |
| Restaurant, 13 produits (par catégories) | Épicerie et restauration | A4 portrait | 3 | 98 Ko |
| Restaurant, 13 produits (par catégories) | Épicerie et restauration | A4 paysage | 4 | 95 Ko |
| **50 produits avec photos** | Minimal clair | A4 portrait | 7 | **235 Ko** |
| Parcours avec photos importées (4 produits) | Minimal clair | A4 portrait | 2 | 39 Ko |

Tous les fichiers sont nettement sous les limites d'envoi de WhatsApp et des e-mails.

**Temps de génération** (épicerie, 14 produits, mesuré dans Edge) : 1,5 s sur ordinateur ;
3,0 s avec un processeur ralenti ×4 (simulation d'un téléphone d'entrée de gamme).

## Points vérifiés

| Exigence | Statut | Détail |
|---|---|---|
| A4 propre | ✅ | 595 × 842 pt (portrait) / 842 × 595 pt (paysage) |
| Texte lisible | ✅ | Texte vectoriel (Helvetica, Times), sélectionnable, net à tout zoom |
| Images bien cadrées, non étirées | ✅ | Recadrage centré (« Remplir ») ou photo entière sur fond neutre ; découpe vectorielle des coins arrondis et des cercles |
| Prix visibles | ✅ | Gras, couleur lisible (assombrie automatiquement si la couleur choisie est trop claire) |
| Coordonnées visibles | ✅ | Couverture + pied de chaque page (réduction de taille puis retrait des moins importantes si trop long) |
| Numéros de page | ✅ | « 2 / 4 » sur chaque page intérieure |
| Aucun texte coupé | ✅ | Retour à la ligne calculé avec les métriques officielles des polices ; « … » au-delà du nombre de lignes prévu |
| Aucun chevauchement | ✅ | Grilles fixes, vérification automatique |
| Passage à la page suivante | ✅ | Pagination ; un intertitre n'est jamais seul en bas de page |
| Progression visible | ✅ | Barre + étape (« Préparation des photos 3 sur 14… ») + bouton « Annuler » |
| Message de succès / d'erreur | ✅ | « Votre catalogue est prêt ! » avec nom, pages et poids ; message d'erreur avec conseils |
| Bouton de téléchargement | ✅ | Lien de téléchargement direct + « Partager le PDF » si le téléphone le permet |
| Nom de fichier propre | ✅ | `catalogue-nom-de-la-boutique-AAAA-MM-JJ.pdf` (accents retirés) |
| Liens cliquables | ✅ | WhatsApp (message pré-rempli par produit), e-mail, Instagram, Facebook |
| Métadonnées | ✅ | Titre « Catalogue — {boutique} », auteur, créateur |
| Export de démonstration | ✅ | Filigrane diagonal à 10 % d'opacité + mention en bas de page, catalogue utilisable |
| Aperçu = PDF | ✅ | Même moteur ; nombre de pages de l'aperçu = nombre de pages du PDF (vérifié en paysage) |

## Limites connues de l'export

- Polices standard PDF : émojis et alphabets non latins retirés (l'utilisateur est prévenu dans
  l'aperçu et après l'export).
- La couleur exacte à l'impression dépend de l'imprimante (PDF en RVB).
- Résolution des photos : 150 dpi (suffisant pour l'écran et une impression bureautique) ; 220 dpi prévus
  pour l'offre Premium.
