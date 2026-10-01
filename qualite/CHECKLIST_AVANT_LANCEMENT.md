# Check-list avant lancement

À cocher par le porteur du projet avant toute mise en ligne publique.

## 1. Décisions et contenus

- [ ] Nom de marque définitif choisi (et recherche d'antériorité faite).
- [ ] Textes du site relus par une personne de la cible (vendeur WhatsApp).
- [ ] Pages légales complétées (éditeur, hébergeur, contact, durées, droit applicable) et relues par
      un professionnel ; bandeau « modèle informatif » retiré après validation.
- [ ] Adresse e-mail de contact réelle créée et renseignée (`VITE_CONTACT_EMAIL`).
- [ ] Comptes sociaux créés (si souhaité) et renseignés (`VITE_SOCIAL_*`).
- [ ] Choix confirmés : sauvegarde locale par défaut, limite gratuite de 50 produits, filigrane.

## 2. Technique

- [ ] Nom de domaine acheté ; `VITE_SITE_URL` renseigné (sitemap, canoniques, Open Graph).
- [ ] `npm ci && npm run build` sans erreur ; `npm test` et `npm run test:e2e` au vert.
- [ ] Hébergement configuré selon DEPLOYMENT_GUIDE.md (HTTPS, statut 404, cache des `assets/`).
- [ ] En-têtes de sécurité ajoutés (SECURITY.md) et vérifiés en ligne.
- [ ] Aucune variable secrète dans le projet ni chez l'hébergeur côté frontend.

## 3. Tests terrain (indispensables)

- [ ] 2 ou 3 téléphones Android d'entrée de gamme réels : création de 20 à 50 produits avec de vraies
      photos, export, téléchargement.
- [ ] 1 iPhone (Safari) : import photo, export, partage.
- [ ] Envoi du PDF sur WhatsApp, ouverture chez un client, clic sur un produit → message pré-rempli.
- [ ] Connexion lente réelle (3G/4G faible).
- [ ] Test avec 5 commerçants sans aide : noter où ils bloquent, corriger les textes.
- [ ] Lecteur d'écran (TalkBack) sur le parcours principal.

## 4. Lancement

- [ ] Aperçu de partage (Open Graph) vérifié sur WhatsApp et Facebook.
- [ ] Site déclaré dans Google Search Console et Bing Webmaster Tools ; sitemap soumis.
- [ ] Contenus réseaux sociaux préparés (marketing/) avec de vraies captures.
- [ ] Procédure de support : qui répond, en combien de temps, avec quels messages types.
- [ ] (Si mesure d'audience) outil respectueux de la vie privée installé et politique mise à jour.

## 5. Avant d'ouvrir le Premium (plus tard)

- [ ] Prestataire de paiement choisi selon les pays cibles (docs/PAYMENT_INTEGRATION_GUIDE.md).
- [ ] Prix validés par test (docs/PREMIUM_STRATEGY.md).
- [ ] Vérification des licences côté serveur, politique de remboursement définitive.
