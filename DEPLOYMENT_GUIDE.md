# Guide de déploiement (pour plus tard)

> Rien n'a été déployé. Aucun compte d'hébergement n'a été créé. Ce guide prépare la mise en ligne,
> à réaliser par le porteur du projet.

## 1. Avant tout déploiement

1. Choisir le nom de domaine définitif.
2. Créer `.env.production.local` (non versionné) ou renseigner les variables dans l'hébergeur :
   ```
   VITE_SITE_URL=https://www.votre-domaine.com
   VITE_CONTACT_EMAIL=contact@votre-domaine.com
   VITE_SOCIAL_FACEBOOK=        (seulement si le compte existe)
   VITE_SOCIAL_INSTAGRAM=
   VITE_SOCIAL_TIKTOK=
   VITE_SOCIAL_WHATSAPP=
   VITE_PREMIUM_CHECKOUT_URL=   (laisser vide : aucun paiement en V1)
   ```
   Ces variables sont **publiques** (intégrées au site). Jamais de secret.
3. Compléter les pages légales (éléments entre crochets) et faire relire les textes.
4. Lancer `npm ci && npm run build` puis vérifier `dist/` avec `npm run preview`.

Résultat du build : dossier `dist/` 100 % statique.

| Fichier | Rôle |
|---|---|
| `index.html`, `<page>/index.html` | Pages pré-rendues (ex. `faq/index.html`) |
| `404.html` | Page d'erreur (à servir avec le statut 404) |
| `sitemap.xml`, `robots.txt` | Générés avec `VITE_SITE_URL` |
| `assets/*` | Fichiers versionnés (nom contenant un hash) : cache long possible |

Règles de service attendues :
- `/faq` et `/faq/` → `dist/faq/index.html` (pas de redirection obligatoire) ;
- adresse inconnue → `404.html` avec le statut **404** (ne pas renvoyer `index.html` en 200 pour tout).
  Si l'hébergeur renvoie quand même `index.html`, l'application reconstruit la bonne page côté
  navigateur (attribut `data-route`), mais le statut HTTP reste incorrect pour le SEO.

## 2. Vercel

1. Importer le dépôt Git dans Vercel (compte créé par le porteur du projet).
2. Framework : « Other » (ou Vite). Commande de build : `npm run build`. Dossier de sortie : `dist`.
3. Variables d'environnement : celles du §1 (onglet *Environment Variables*).
4. Fichier `vercel.json` conseillé à la racine :
   ```json
   {
     "cleanUrls": true,
     "trailingSlash": false,
     "headers": [
       { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
       { "source": "/(.*)", "headers": [
         { "key": "X-Content-Type-Options", "value": "nosniff" },
         { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
         { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
       ] }
     ]
   }
   ```
   Vercel sert automatiquement `404.html` pour les adresses inconnues.

## 3. Netlify

1. Nouveau site depuis Git (compte créé par le porteur du projet). Build : `npm run build`, publication : `dist`.
2. Variables d'environnement : *Site configuration → Environment variables*.
3. Fichier `netlify.toml` conseillé :
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [build.environment]
     NODE_VERSION = "22"

   [[headers]]
     for = "/assets/*"
     [headers.values]
       Cache-Control = "public, max-age=31536000, immutable"

   [[headers]]
     for = "/*"
     [headers.values]
       X-Content-Type-Options = "nosniff"
       Referrer-Policy = "strict-origin-when-cross-origin"
       Permissions-Policy = "camera=(), microphone=(), geolocation=()"
   ```
   Netlify sert `404.html` avec le statut 404 et `faq/index.html` pour `/faq`. Ne **pas** ajouter de
   règle `/* /index.html 200` (inutile ici et néfaste pour le SEO).

## 4. Hébergeur statique classique (mutualisé, cPanel, Hostinger…)

1. Lancer `npm run build` sur votre ordinateur.
2. Envoyer **le contenu** de `dist/` dans le dossier public (`public_html/` ou `www/`) par FTP/SFTP ou le
   gestionnaire de fichiers.
3. Serveur Apache : ajouter un fichier `.htaccess` dans le dossier public :
   ```apache
   ErrorDocument 404 /404.html
   DirectorySlash Off
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME}/index.html -f
   RewriteRule ^(.*)$ $1/index.html [L]
   <IfModule mod_headers.c>
     Header set X-Content-Type-Options "nosniff"
     Header set Referrer-Policy "strict-origin-when-cross-origin"
     <FilesMatch "\.(js|css|svg|png)$">
       Header set Cache-Control "public, max-age=31536000, immutable"
     </FilesMatch>
   </IfModule>
   ```
4. Activer HTTPS (certificat Let's Encrypt gratuit, généralement proposé par l'hébergeur).

## 5. Serveur personnel (VPS, Nginx)

1. Copier `dist/` dans `/var/www/catalogue-express` (par `rsync` ou depuis un pipeline).
2. Configuration Nginx :
   ```nginx
   server {
     listen 443 ssl http2;
     server_name www.votre-domaine.com;
     root /var/www/catalogue-express;

     # ssl_certificate / ssl_certificate_key : Let's Encrypt (certbot)

     location /assets/ {
       add_header Cache-Control "public, max-age=31536000, immutable";
       try_files $uri =404;
     }
     location / {
       try_files $uri $uri/index.html $uri.html =404;
     }
     error_page 404 /404.html;

     add_header X-Content-Type-Options nosniff always;
     add_header Referrer-Policy strict-origin-when-cross-origin always;
     add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
     gzip on;
     gzip_types text/css application/javascript image/svg+xml application/json;
   }
   server { listen 80; server_name www.votre-domaine.com; return 301 https://$host$request_uri; }
   ```
3. `sudo nginx -t && sudo systemctl reload nginx`.

## 6. Après la mise en ligne

- [ ] Tester sur un vrai téléphone Android (4G et connexion lente) : création + téléchargement + envoi WhatsApp.
- [ ] Vérifier `https://votre-domaine/sitemap.xml`, `robots.txt`, une adresse inconnue (statut 404).
- [ ] Tester l'aperçu de partage (Open Graph) en collant le lien dans WhatsApp et Facebook.
- [ ] Déclarer le site dans Google Search Console et Bing Webmaster Tools.
- [ ] Vérifier les en-têtes de sécurité (outil type securityheaders.com).
