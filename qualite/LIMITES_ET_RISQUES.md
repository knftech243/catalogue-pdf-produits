# Limites connues et risques

| # | Limite / risque | Impact | Probabilité | Mesure actuelle | Solution future |
|---|---|---|---|---|---|
| 1 | **Caractères non latins et émojis** non affichables dans le PDF (polices standard WinAnsi) | Moyen pour certains commerçants (émojis dans les noms, symbole ₦, alphabets arabe ou chinois) | Moyenne | Caractères retirés automatiquement ; lettres accentuées translittérées (ș → s) ; message dans l'aperçu et après export | Embarquer une police Unicode sous-ensemble (ex. Noto Sans) via jsPDF, en option |
| 2 | **Photos HEIC** (iPhone) non décodables dans la plupart des navigateurs | Moyen sur iPhone | Moyenne | Message explicatif avec solution (« Le plus compatible », ou passer par WhatsApp) | Décodeur HEIC en WebAssembly chargé à la demande |
| 3 | **Données locales au navigateur** : pas de synchronisation, effaçables par le navigateur (nettoyage, mode privé) | Élevé si le commerçant change de téléphone | Moyenne | Information claire, conseil de garder le PDF ; mode privé détecté | Export/import d'un fichier de sauvegarde (.json + photos) ; sauvegarde en ligne (V2, avec compte) |
| 4 | **Mémoire des téléphones d'entrée de gamme** avec beaucoup de grandes photos | Lenteur, rarement fermeture de l'onglet | Faible à moyenne | Réduction à 1600 px, miniatures 480 px, export photo par photo, limite 200 produits | Réduire automatiquement la résolution au-delà de 100 produits ; test terrain |
| 5 | **PDF non balisé** (pas de structure d'accessibilité) | Faible (lecture d'écran approximative du PDF) | — | Texte vectoriel sélectionnable | Générateur PDF avec balisage, ou version HTML accessible du catalogue |
| 6 | **Pas de mode hors-ligne** | Moyen en zone de connexion instable | Moyenne | Site léger ; une fois l'outil ouvert, tout fonctionne sans réseau sauf le premier chargement de jsPDF | Service worker (précache de l'outil et de jsPDF) |
| 7 | **Filigrane « version démo » contournable** (aucune vérification serveur) | Faible en V1 (pas de vente) | — | Assumé : rien n'est vendu | Licence signée côté serveur (docs/PAYMENT_INTEGRATION_GUIDE.md) |
| 8 | **Safari iOS** : téléchargement d'un fichier généré (ouvre un aperçu plutôt qu'un téléchargement direct) | Faible | Moyenne | Bouton « Partager le PDF » quand disponible | Test sur iPhone réel, instructions dédiées |
| 9 | **Pages légales non validées** | Élevé avant publication (conformité) | Certaine sans action | Bandeau « modèle informatif » | Relecture par un juriste, coordonnées réelles |
| 10 | **Nom de marque non protégé** | Moyen (conflit de marque possible) | Inconnue | Propositions et recommandation documentées | Recherche d'antériorité OAPI / RDC / INPI / EUIPO |
| 11 | **Liens WhatsApp** : numéro saisi sans indicatif → pas de lien | Faible | Moyenne | Avertissement dans le formulaire | Proposer l'indicatif du pays automatiquement |
| 12 | **Couleur d'impression** (PDF en RVB) | Faible | Faible | — | Option d'export « impression » |
| 13 | **Statut 404** dépend de la configuration de l'hébergeur | Faible (SEO) | Faible | Page 404 pré-rendue + `data-route` côté navigateur ; configurations fournies | Vérifier après déploiement |
| 14 | **Avertissements ESLint « fast refresh »** (4) | Nul en production | — | Accepté | Séparer les hooks dans des fichiers dédiés |

## Hypothèses produit à valider (non techniques)

- La sauvegarde locale activée par défaut est acceptée par les utilisateurs (sinon : désactivée par défaut).
- Le filigrane discret n'empêche pas l'usage réel du PDF gratuit… mais donne envie du Premium.
- Les commerçants comprennent l'ajout « plusieurs photos puis compléter les prix ».
