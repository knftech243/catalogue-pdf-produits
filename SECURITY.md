# Sécurité et confidentialité

## Règle fondamentale

> **Aucun secret, token, mot de passe, clé API privée ou information bancaire ne doit être enregistré
> dans Git, dans le code frontend ou dans un fichier partagé.**

## Modèle de sécurité de la V1

- **Pas de serveur applicatif, pas de base de données, pas de compte** : la surface d'attaque côté
  serveur se limite à l'hébergement de fichiers statiques.
- **Données de l'utilisateur traitées localement** : photos, textes et PDF ne quittent pas le navigateur.
  Stockage local (localStorage + IndexedDB) désactivable et effaçable depuis l'outil.
- **Aucune clé** dans le projet : `.env.example` ne contient que des variables publiques
  (`VITE_…` : URL du site, e-mail de contact, liens sociaux, future URL de paiement).
- **Aucun script tiers** (pas d'analytics, pas de publicité, pas de CDN) : tout est servi depuis le site.
- **Aucun paiement** : l'offre Premium est une interface d'information, sans encaissement.

## Points d'attention vérifiés

| Sujet | Mesure |
|---|---|
| Injection HTML (XSS) | React échappe tout le texte ; aucun `dangerouslySetInnerHTML` dans l'application. Les textes du PDF sont dessinés comme du texte, jamais interprétés. Le JSON-LD du pré-rendu échappe `<`. |
| Fichiers importés | Vérification du type et de la taille (≤ 25 Mo), décodage par le navigateur dans un canvas, ré-encodage en JPEG/PNG : aucune donnée d'origine (dont métadonnées EXIF/GPS) n'est conservée. |
| Liens dans le PDF | Liens générés uniquement vers `https://wa.me/…`, `mailto:` et les profils Instagram/Facebook saisis ; paramètres encodés. |
| Données locales | Lues avec validation (`sanitizeCatalog`), données abîmées ignorées. |
| Liens externes du site | `rel="noopener noreferrer"` sur les liens ouverts dans un nouvel onglet. |
| Formulaire de contact | Pas d'envoi serveur : ouverture de l'application e-mail. Rappel de ne jamais envoyer de mot de passe ni de données bancaires. |
| Dépendances | `npm audit` : 0 vulnérabilité connue au moment de l'installation. |

## En-têtes HTTP (appliqués automatiquement sur Netlify)

Les en-têtes sont définis dans une **source unique**, [`src/config/headers.ts`](src/config/headers.ts),
et écrits au build dans `dist/_headers` (lu par Netlify). Sur toutes les réponses :

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Robots-Tag: noindex, nofollow        (préproduction uniquement, tant que VITE_ALLOW_INDEXING ≠ true)
```

`style-src 'unsafe-inline'` est nécessaire pour les styles dynamiques (couleurs, barres de progression).
Aucun `unsafe-eval`, aucun script externe. Le JSON-LD est un script de type `application/ld+json`,
non exécuté. Pour un autre hébergeur, reprendre les mêmes valeurs (voir
[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)).

## Futur paiement

Voir [docs/PAYMENT_INTEGRATION_GUIDE.md](docs/PAYMENT_INTEGRATION_GUIDE.md) : clés secrètes uniquement
dans les variables d'environnement d'une fonction serveur, vérification des webhooks, jamais de
données de carte ni de code Mobile Money sur le site.

## Signaler une vulnérabilité

Écrire à l'adresse de contact du site (à définir : voir TODO_VALIDATION_HUMAINE.md) en décrivant le
problème. Ne pas publier la faille avant correction.
