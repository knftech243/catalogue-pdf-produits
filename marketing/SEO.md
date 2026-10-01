# SEO — mots-clés, titres, descriptions et contenus

Principes : contenus utiles et honnêtes, en français, pensés pour les recherches sur téléphone.
Aucune statistique inventée, aucun faux avis, aucun texte caché.

## 1. Objectifs de recherche et mots-clés

| Objectif | Mots-clés principaux | Variantes / longue traîne | Page cible |
|---|---|---|---|
| Créer un catalogue PDF de produits | créer catalogue pdf produits | créer un catalogue pdf gratuit, faire un catalogue produit sur téléphone, catalogue pdf android | `/` et `/creer` |
| Catalogue WhatsApp | catalogue whatsapp | envoyer catalogue whatsapp pdf, catalogue produits whatsapp gratuit, comment partager un catalogue sur whatsapp | `/` et article dédié |
| Catalogue de vêtements | catalogue vêtements pdf | catalogue boutique de mode, catalogue pagne wax pdf, présenter ma collection | `/modeles`, `/exemples` |
| Menu de restaurant | menu restaurant pdf | créer menu pdf gratuit, menu fast food pdf, menu whatsapp restaurant | `/exemples`, article dédié |
| Cosmétiques | catalogue cosmétiques | catalogue produits de beauté pdf, catalogue parfums | `/modeles`, `/exemples` |
| Liste de prix | liste de prix professionnelle | liste de prix épicerie, tarifs produits pdf, liste de prix whatsapp | `/exemples`, article dédié |

Mots-clés géographiques à tester dans les contenus : Kinshasa, Lubumbashi, Abidjan, Dakar, Douala,
Bruxelles, Paris (uniquement dans des exemples réalistes, sans bourrage).

## 2. Titres et meta descriptions (implémentés dans `src/routes.ts`)

| Page | Title | Meta description |
|---|---|---|
| Accueil | Catalogue Express — Créez votre catalogue PDF produits en quelques minutes | Transformez vos photos produits en catalogue PDF professionnel, prêt à partager sur WhatsApp, Facebook ou par e-mail. Gratuit, simple, sans inscription… |
| Créer | Créer mon catalogue PDF gratuitement — Catalogue Express | Ajoutez vos photos, vos prix et vos coordonnées, choisissez un modèle et téléchargez votre catalogue PDF… |
| Modèles | Modèles de catalogues PDF : mode, cosmétiques, restaurant, épicerie | Quatre modèles de catalogues PDF prêts à l'emploi… |
| Exemples | Exemples de catalogues PDF produits | Boutique de vêtements, cosmétiques, menu de restaurant et liste de prix d'épicerie… |
| Tarifs | Tarifs — Catalogue Express gratuit et future offre Premium | Aperçu et export de démonstration gratuits… |
| FAQ | Questions fréquentes | Photos, prix, devises, partage WhatsApp, confidentialité… |

Déjà en place : un H1 par page, balises Open Graph, URL canonique, `sitemap.xml`, `robots.txt`, données
structurées `WebApplication` (accueil) et `FAQPage` (FAQ), HTML pré-rendu.
**À faire avant la mise en ligne** : définir `VITE_SITE_URL` (sinon les URL utilisent example.com).

## 3. Idées d'articles (blog / guides)

1. Comment créer un catalogue PDF de vos produits depuis votre téléphone (guide pas à pas).
2. Comment envoyer un catalogue PDF sur WhatsApp (Android et iPhone).
3. Menu de restaurant en PDF : modèle gratuit et conseils de présentation.
4. Bien photographier ses produits avec un téléphone : 7 conseils simples.
5. Catalogue de vêtements : comment présenter tailles, couleurs et promotions.
6. Liste de prix d'épicerie : la mettre à jour sans tout refaire.
7. Catalogue de cosmétiques : quelles informations indiquer (contenance, usage, ingrédients).
8. Vendre sur WhatsApp : organiser ses produits et répondre plus vite aux clients.
9. PDF ou photos : quel format pour présenter ses produits ?
10. Comment fixer et afficher ses prix en francs congolais, FCFA ou dollars.

Chaque article : un exemple réel (fictif mais crédible), des captures de l'outil, un lien vers `/creer`.

## 4. Pages à créer ultérieurement

- `/catalogue-whatsapp` — page dédiée « Créer un catalogue pour WhatsApp ».
- `/menu-restaurant-pdf` — page dédiée aux restaurants, avec exemple de menu.
- `/catalogue-vetements-pdf`, `/catalogue-cosmetiques`, `/liste-de-prix` — pages par métier.
- `/guide` ou `/blog` — guides pratiques (articles ci-dessus).
- Pages pays (après validation du marché) : RDC, Côte d'Ivoire, Sénégal, Cameroun, diaspora.

## 5. Bonnes pratiques à maintenir

- Une intention de recherche par page ; titres de 50 à 65 caractères, descriptions de 120 à 160.
- Textes alternatifs descriptifs sur toutes les images utiles.
- Pages légères (déjà : polices système, aperçus en SVG chargés à la demande).
- Mettre à jour le sitemap à chaque nouvelle page (automatique : il est généré depuis `src/routes.ts`).
- Après mise en ligne : déclarer le site dans Google Search Console et Bing Webmaster Tools.
