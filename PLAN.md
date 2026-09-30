# PLAN — Catalogue Express

> Plan de travail de la version 1 (V1). Mis à jour au fil du projet.
> Voir aussi : [PROGRESS.md](PROGRESS.md) (avancement) et [DECISIONS.md](DECISIONS.md) (choix techniques et produit).

## 1. Objectif de la V1

Une application web **100 % frontend / statique** qui transforme des photos de produits en
**catalogue PDF professionnel**, téléchargeable puis partageable manuellement (WhatsApp,
Facebook, Instagram, e-mail).

- Aucun compte, aucune base de données, aucun serveur applicatif, aucun paiement réel.
- Les photos sont traitées **dans le navigateur** et ne quittent jamais l'appareil.
- Interface **entièrement en français**, pensée d'abord pour les **téléphones Android**.

## 2. Parcours utilisateur (outil « Créer mon catalogue »)

| Étape | Écran | Contenu principal |
|---|---|---|
| 1 | Boutique | Nom, slogan, propriétaire, WhatsApp, téléphone, e-mail, adresse, devise, couleur, logo, Instagram, Facebook, bouton « Utiliser des données d'exemple » |
| 2 | Produits | Ajout (photo, nom, prix, ancien prix, description, catégorie, référence, disponibilité), ajout de plusieurs photos d'un coup, modifier, dupliquer, supprimer, monter/descendre, tri, filtre par catégorie, « Charger une boutique exemple » |
| 3 | Modèle | 4 modèles, A4 portrait/paysage, densité (produits par page), couleur, options (descriptions, ancien prix, contacts, regroupement par catégorie, cadrage des photos) |
| 4 | Aperçu | Rendu fidèle page par page (même moteur de mise en page que le PDF), nombre de pages, nom du fichier, bouton « Recommencer » |
| 5 | Export | Génération PDF avec progression, téléchargement, partage via la feuille de partage du téléphone, offre Premium présentée honnêtement (non active) |

## 3. Architecture technique

```
React 19 + TypeScript + Vite
├── Routeur maison léger (History API) + pré-rendu statique des pages (SEO)
├── Moteur de mise en page PDF « pur » (src/pdf/layout) → liste d'opérations de dessin
│   ├── Rendu SVG  → aperçu à l'écran (src/pdf/preview)
│   └── Rendu jsPDF → fichier PDF vectoriel (src/pdf/render)
├── Traitement d'images local (canvas) : redimensionnement, compression, recadrage
├── Stockage local : localStorage (texte) + IndexedDB (photos) — désactivable, effaçable
└── Configuration Premium (src/config/plans.ts) prête à être branchée plus tard
```

Principe clé : **un seul moteur de mise en page** alimente l'aperçu et le PDF, ce qui garantit
que ce que l'utilisateur voit est ce qu'il télécharge.

## 4. Pages du site

Accueil · Créer mon catalogue · Modèles · Exemples · Tarifs · FAQ · Contact ·
Politique de confidentialité · Conditions d'utilisation · Politique de remboursement ·
Mentions légales · Page 404.

## 5. Étapes de réalisation

1. Analyse du dossier, PLAN / DECISIONS / PROGRESS.
2. Architecture (Vite, TypeScript, ESLint, Prettier, Vitest, Playwright).
3. Identité visuelle + landing page.
4. Outil de création (formulaires, produits, stockage local).
5. Moteur de mise en page + 4 modèles + aperçu.
6. Export PDF (jsPDF) + progression + téléchargement/partage.
7. Données de démonstration (4 boutiques, visuels générés localement).
8. SEO (pré-rendu, meta, Open Graph, sitemap, robots) et performance.
9. Contenus marketing et documents Premium / paiement.
10. Tests unitaires, tests E2E (navigateur réel), tests des 30 scénarios.
11. Corrections, vérification mobile / ordinateur, build de production.
12. Documentation complète + RAPPORT_FINAL.md.

## 6. Hors périmètre V1 (volontairement)

Compte utilisateur, sauvegarde en ligne, paiement réel, connexion directe à WhatsApp,
back-office, analytics, service worker hors-ligne.
