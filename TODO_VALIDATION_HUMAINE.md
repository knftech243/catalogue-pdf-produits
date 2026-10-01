# À valider par vous (décisions humaines)

Ces points ne peuvent pas être tranchés par l'équipe technique seule. Rien n'est bloquant pour tester
l'application en local.

## Marque et contenus

- [ ] **Nom définitif** : garder « Catalogue Express » ou choisir Katalo / Étalo / MaVitrine
      (voir [branding/NOMS_DE_MARQUE.md](branding/NOMS_DE_MARQUE.md)) après recherche d'antériorité.
- [ ] Valider le logo, les couleurs et le ton ([branding/IDENTITE_VISUELLE.md](branding/IDENTITE_VISUELLE.md)).
- [ ] Relire les textes du site (accueil, FAQ) et les contenus marketing.
- [ ] Valider l'usage des boutiques fictives (Kinshasa, Abidjan, Bruxelles) et de leurs illustrations.

## Légal (obligatoire avant publication)

- [ ] Compléter les éléments entre crochets des pages légales : éditeur, adresse, immatriculation,
      directeur de la publication, hébergeur, e-mail de contact, durées de conservation, droit applicable.
- [ ] Faire relire Politique de confidentialité, Conditions d'utilisation, Politique de remboursement et
      Mentions légales par un professionnel du droit du pays concerné.
- [ ] Retirer ensuite le bandeau « modèle informatif » des pages relues (texte dans `src/config/site.ts`).

## Configuration

- [ ] Adresse e-mail de contact réelle → `VITE_CONTACT_EMAIL` (sinon le formulaire reste désactivé).
- [ ] Comptes sociaux officiels (seulement s'ils existent) → `VITE_SOCIAL_*`.
- [ ] Nom de domaine et `VITE_SITE_URL` (sitemap, URL canoniques, Open Graph).
- [ ] Hébergeur choisi (voir [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)).

## Produit

- [ ] **Sauvegarde locale activée par défaut** (DECISIONS D05) : confirmer ce choix ou passer à
      « désactivée par défaut ».
- [ ] **Limite gratuite de 50 produits par export** (D16) et **mention « version démo »** : confirmer.
- [ ] Liens WhatsApp cliquables activés par défaut (D10) : confirmer.
- [ ] Offre Premium : modèle (par export, packs, durée) et prix à tester
      ([docs/PREMIUM_STRATEGY.md](docs/PREMIUM_STRATEGY.md)).
- [ ] Prestataire de paiement selon vos pays cibles
      ([docs/PAYMENT_INTEGRATION_GUIDE.md](docs/PAYMENT_INTEGRATION_GUIDE.md)).
- [ ] Mesure d'audience respectueuse de la vie privée : oui/non (impose une mise à jour de la politique
      de confidentialité).

## Tests terrain

- [ ] Tester sur 2 ou 3 vrais téléphones Android d'entrée de gamme et un iPhone.
- [ ] Faire tester par 5 à 10 commerçants réels (sans aide) et noter les blocages.
- [ ] Vérifier l'envoi du PDF sur WhatsApp et son ouverture chez le client.
