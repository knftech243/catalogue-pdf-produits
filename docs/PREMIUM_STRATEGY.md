# Stratégie Premium — hypothèses à tester

> **Statut : aucune offre payante n'est active.** Ce document décrit des hypothèses de travail. Les
> prix cités ne sont **pas** affichés sur le site (la page Tarifs indique « tarif annoncé au
> lancement ») et devront être validés par des tests réels avant toute mise en vente.

## 1. Ce qui est gratuit aujourd'hui (V1)

| Fonction | Gratuit |
|---|---|
| Création du catalogue, 4 modèles, portrait/paysage | ✅ |
| Aperçu illimité | ✅ |
| Export PDF de démonstration (mention « version démo » discrète) | ✅ |
| Jusqu'à 50 produits par export | ✅ |
| Logo, couleur, liens WhatsApp et réseaux sociaux | ✅ (pourraient devenir Premium plus tard, voir §3) |

Les droits sont centralisés dans [`src/config/plans.ts`](../src/config/plans.ts) : modifier une ligne
suffit pour réserver une fonction au Premium.

## 2. Fonctions Premium prévues (non actives)

- Export sans filigrane.
- Nombre de produits étendu (jusqu'à 200 par catalogue).
- Tous les modèles, y compris les modèles futurs.
- Ajout de logo, couleurs personnalisées, liens sociaux (si on décide de les retirer du gratuit).
- Meilleure résolution des photos (220 dpi au lieu de 150).
- Page de couverture personnalisée (photo de couverture, texte libre).
- Plusieurs exports, plusieurs catalogues enregistrés, duplication de catalogue.
- Sauvegarde en ligne et reprise sur un autre appareil (nécessite un backend : V2).

## 3. Hypothèses de prix

Contexte : petits commerçants, budget serré, paiement souvent par Mobile Money, usage ponctuel (un
nouveau catalogue quand la collection ou les prix changent).

| Hypothèse | Prix | Ce que l'on teste |
|---|---|---|
| A | **3 $** | Seuil psychologique bas : achat « impulsif », comparable à un forfait internet journalier. |
| B | **5 $** | Point d'équilibre : prix d'un repas simple, perçu comme sérieux. |
| C | **7 $** | Valeur perçue « professionnelle » ; risque de freiner les petits vendeurs. |

Ces prix sont des **hypothèses**. Ils doivent être convertis et arrondis en monnaie locale
(ex. 3 $ ≈ montant rond en CDF ou FCFA) et testés pays par pays : le pouvoir d'achat et les habitudes
de paiement diffèrent fortement entre Kinshasa, Abidjan, Dakar et la diaspora.

## 4. Modèles commerciaux possibles

| Modèle | Principe | Avantages | Inconvénients |
|---|---|---|---|
| **Paiement par export** | On paie chaque PDF sans filigrane (ex. 3 $) | Simple à comprendre, aligné sur l'usage ponctuel | Friction à chaque mise à jour des prix ; revenu faible par client |
| **Crédits / packs** | Pack de 3 exports (5 $), 10 exports (12 $) | Encourage la mise à jour régulière, prix unitaire dégressif | Gestion d'un solde (nécessite un compte ou un code) |
| **Accès à durée limitée** | Accès illimité 30 jours (ex. 5 $) | Idéal pour les vendeurs actifs qui changent souvent de prix | Ressemble à un abonnement (méfiance), renouvellement à gérer |
| **Accès à vie** | Paiement unique (ex. 15–25 $) | Très attractif, argument marketing fort | Pas de revenu récurrent, coût du support à long terme |

### Idées de packs d'exports

- **Découverte** : 1 export sans filigrane — 3 $.
- **Boutique** : 5 exports — 9 $ (1,80 $ l'export).
- **Pro** : 15 exports + couverture personnalisée — 19 $.
- **Lancement** (offre limitée) : accès à vie aux 100 premiers clients — prix à tester.

## 5. Protocole d'A/B testing proposé

1. **Phase 0 — intérêt (sans paiement)** : bouton « Débloquer l'export complet » → fenêtre honnête
   « bientôt disponible » + inscription volontaire à une liste d'attente (à créer, avec consentement).
   Mesure : taux de clic sur le bouton parmi les utilisateurs qui ont exporté un PDF.
2. **Phase 1 — prix affiché (fake door honnête)** : afficher aléatoirement 3 $, 5 $ ou 7 $ dans la
   fenêtre, toujours avec la mention « paiement pas encore ouvert ». Mesure : clic « Me prévenir ».
   Ne jamais simuler un paiement.
3. **Phase 2 — paiement réel** sur 2 variantes maximum, 2 à 4 semaines chacune, même trafic.
   Indicateurs : conversion, revenu par visiteur, demandes de remboursement, messages au support.
4. Taille d'échantillon : viser au moins 300 à 500 visiteurs ayant généré un PDF par variante avant de
   conclure ; sinon, garder la variante la plus simple.

Une mesure d'audience respectueuse de la vie privée (sans cookie, ex. Plausible ou Umami auto-hébergé)
sera nécessaire ; elle n'est pas installée en V1 (voir la politique de confidentialité).

## 6. Recommandation pour la V1 commerciale

1. **Commencer par le paiement par export + un pack**, sans compte utilisateur :
   - 1 export sans filigrane à **3 $** (ou équivalent local) ;
   - pack de 5 exports à **9 $**.
2. Délivrer un **code de déblocage** (licence courte) par e-mail/SMS après paiement chez un prestataire
   (Gumroad, Payhip, Flutterwave…), vérifiable sans stocker de données personnelles côté site.
3. Garder le gratuit généreux (aperçu complet, export démo) : c'est le moteur du bouche-à-oreille,
   chaque PDF partagé porte la mention « Créé avec Catalogue Express ».
4. Réévaluer après 1 à 2 mois de données réelles (Phase 2).

Voir [PAYMENT_INTEGRATION_GUIDE.md](PAYMENT_INTEGRATION_GUIDE.md) pour l'intégration technique.
