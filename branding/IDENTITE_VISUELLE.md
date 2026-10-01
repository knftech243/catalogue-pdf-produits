# Identité visuelle — Catalogue Express

Les valeurs ci-dessous sont celles réellement utilisées dans le code (`src/styles/base.css`).

## 1. Intention

Chaleureuse, fiable et rapide. Inspirée des couleurs des marchés (mangue, sable) et d'un bleu nuit
sérieux pour la confiance. Volontairement différente du vert de WhatsApp pour éviter toute confusion
avec cette marque.

## 2. Logo

| Fichier | Usage |
|---|---|
| [`logo.svg`](logo.svg) | Logo principal (pictogramme + nom) sur fond clair |
| [`logo-blanc.svg`](logo-blanc.svg) | Version pour fond foncé (pied de page, vidéos) |
| [`logo-mark.svg`](logo-mark.svg) | Pictogramme seul : favicon, icône d'application, avatar |

Le pictogramme représente une page de catalogue (grille de 4 produits) avec deux traits de vitesse
(« express »). Zone de protection : au moins la moitié de la hauteur du pictogramme autour du logo.
Taille minimale : 24 px de haut pour le pictogramme, 120 px de large pour le logo complet.

Interdits : déformer, changer les couleurs du pictogramme, ajouter une ombre, poser le logo coloré sur
un fond orange.

## 3. Couleurs

### Couleurs principales

| Nom | Hex | Usage |
|---|---|---|
| Encre (bleu nuit) | `#1B1F3B` | Texte principal, titres, boutons secondaires foncés, pied de page |
| Mangue | `#FF7A1A` | Bouton d'action principal, accents, pictogramme |
| Crème | `#FFFBF6` | Fond de page |
| Blanc | `#FFFFFF` | Cartes, formulaires |

### Couleurs secondaires

| Nom | Hex | Usage |
|---|---|---|
| Sable | `#F7ECDF` | Sections alternées, puces |
| Indigo | `#3B3FD8` | Liens, anneau de focus clavier |
| Menthe foncée | `#047857` | Succès, confidentialité (texte) |
| Rouge | `#B42318` | Erreurs, suppression |
| Ambre | `#8A5300` | Avertissements (texte) |
| Gris texte | `#565C74` | Texte secondaire |

### Contrastes (WCAG 2.1)

- Encre sur crème : ≈ 16:1 (AAA).
- Encre sur Mangue (bouton principal) : ≈ 6,2:1 (AA). **Le texte des boutons orange est toujours foncé,
  jamais blanc** (le blanc sur orange ne passe pas le seuil AA).
- Indigo sur blanc : ≈ 7,3:1. Gris texte sur blanc : ≈ 6,6:1. Menthe foncée sur blanc : ≈ 5,5:1.

## 4. Typographie

**Polices système uniquement** (aucun téléchargement, affichage instantané sur connexion lente) :

```
system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif
```

Soit Roboto sur Android, Segoe UI sur Windows, San Francisco sur iPhone.

| Élément | Taille | Graisse |
|---|---|---|
| H1 | 2 → 3,4 rem (fluide) | 800, interlettrage -0,02 em |
| H2 | 1,55 → 2,35 rem | 800 |
| H3 | 1,1 → 1,3 rem | 700 |
| Texte | 16 px (1 rem), interligne 1,6 | 400 |
| Champs de formulaire | 16 px minimum (évite le zoom automatique sur mobile) | 400 |

Dans les **PDF**, les polices standard Helvetica et Times sont utilisées (voir DECISIONS.md, D03).

## 5. Style visuel

- Formes arrondies et généreuses (rayons 8, 14, 22 px ; boutons en pilule).
- Ombres légères et douces, jamais de noir pur.
- Illustrations vectorielles simples, aplats de couleur, sans dégradés agressifs.
- Photos : produits réels sur fond simple. Jamais de photos de stock représentant de faux clients.

## 6. Ton de communication

- **Tutoiement non, vouvoiement oui** : respectueux et simple (« Ajoutez vos produits »).
- Phrases courtes, verbes d'action, aucun jargon (« fichier PDF », pas « export vectoriel »).
- Honnête : jamais de promesse de revenus, de chiffres inventés ou de faux avis.
- Rassurant sur la confidentialité : « vos photos restent sur votre téléphone ».
- Messages d'erreur : dire ce qui s'est passé **et** quoi faire (« Photo trop lourde (32 Mo). La taille
  maximale est de 25 Mo. Essayez une capture d'écran. »).

## 7. Boutons

| Type | Style | Usage |
|---|---|---|
| Principal | Fond Mangue, texte Encre, pilule | 1 seul par écran : l'action la plus importante (« Créer mon catalogue ») |
| Foncé | Fond Encre, texte blanc | Validation (« Enregistrer », « Suivant ») |
| Secondaire | Fond blanc, bordure grise | Actions secondaires |
| Discret | Sans fond ni bordure | Actions tertiaires (« Retirer ») |
| Danger | Texte rouge, bordure rouge claire | Suppression, effacement (toujours avec confirmation ou annulation) |

Règles : hauteur minimale **48 px** (cible tactile), libellé = verbe + objet, icône à gauche
facultative, état désactivé à 55 % d'opacité, anneau de focus visible (indigo, 2 px + 3 px de blanc).

## 8. Cartes

- Fond blanc, bordure `#E7E1D9` de 1 px, rayon 22 px (14 px pour les cartes compactes).
- Marge intérieure 18 à 28 px selon la largeur d'écran.
- Ombre légère `0 1px 2px rgba(27,31,59,.07)` ; ombre plus marquée au survol si la carte est cliquable.
- Une carte = une idée. Titre H3 + texte court + action éventuelle.

## 9. Icônes

- Pictogrammes au trait maison (`src/components/Icon.tsx`), grille 24 × 24, trait 2 px, extrémités
  arrondies, couleur héritée du texte.
- Décoratives par défaut (masquées aux lecteurs d'écran) ; un texte accessible accompagne toujours
  un bouton icône.
- Pas de logos de marques tierces (WhatsApp, Facebook…) : on utilise des pictogrammes génériques
  (message, partage).

## 10. Responsive mobile

- Conception **mobile d'abord**, testée à 320, 375 et 390 px de large, puis tablette (768 px) et ordinateur.
- Marges latérales fluides de 16 à 32 px. Aucun défilement horizontal.
- Navigation de l'outil en bas d'écran (zone du pouce) : « Retour » / « Suivant ».
- Formulaires sur une colonne sous 600 px ; fenêtres de saisie en plein écran sur téléphone.
- Menu principal replié derrière un bouton sous 820 px.
- Animations réduites si l'utilisateur l'a demandé (`prefers-reduced-motion`).
