# Démonstration — Boutique de vêtements

Boutique **fictive** : « Kiese Mode » — Le style qui vous ressemble, à prix doux.

| Élément | Valeur |
|---|---|
| Secteur | Mode |
| Modèle | Mode élégante |
| Produits | 13 |
| Devise | USD |
| Ville | Kinshasa, Gombe |

## Fichiers

- `catalogue-kiese-mode-demo.pdf` — catalogue PDF généré par l'application (export de démonstration gratuit, avec la
  mention « version démo »).
- `apercu-couverture.png`, `apercu-page-2.png` — aperçus des pages pour les réseaux sociaux.
- `produits.json` — données des produits (noms, prix, descriptions, catégories, disponibilités).
- `visuels/` — illustrations SVG des produits, dessinées pour le projet (libres d'utilisation dans la
  communication de Catalogue Express).

Les numéros de téléphone (+243 00…, +225 00…, +32 000…) et les adresses e-mail en `example.com` sont
volontairement factices : aucun lien du PDF ne mène à une vraie personne.

Pour régénérer : `npm run build && npm run preview`, puis `npm run demo:pdf` dans un autre terminal.
