// Pré-rendu statique (SEO) : génère le HTML de chaque page, la page 404, le sitemap, robots.txt
// et les en-têtes HTTP (dist/_headers, format Netlify).
// Exécuté automatiquement par `npm run build` après les builds client (dist/) et serveur (dist-ssr/).
//
// Garde-fous sur Netlify (variable NETLIFY fournie automatiquement par la plateforme) :
// le build échoue si Node n'est pas en version 24, si VITE_SITE_URL manque ou n'est pas une
// adresse publique valide, ou si une URL d'exemple (example.com) reste dans le site produit.
// En local, ces problèmes ne donnent qu'un avertissement (développement et tests sans configuration).

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const ssrEntry = join(root, 'dist-ssr', 'entry-server.js');
const onNetlify = process.env.NETLIFY === 'true';
const REQUIRED_NODE_MAJOR = 24;

/** Erreur bloquante sur Netlify, simple avertissement en local. */
function guard(message) {
  if (onNetlify) {
    console.error(`✖ Build refusé : ${message}`);
    process.exit(1);
  }
  console.warn(`⚠ ${message} (bloquant sur Netlify)`);
}

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor !== REQUIRED_NODE_MAJOR) {
  guard(
    `Node ${process.versions.node} détecté, Node ${REQUIRED_NODE_MAJOR} est requis (netlify.toml, .nvmrc).`,
  );
}

if (!existsSync(ssrEntry)) fail('dist-ssr/entry-server.js introuvable : lancez `npm run build`.');

const template = readFileSync(join(dist, 'index.html'), 'utf8');
if (!template.includes('<!--app-html-->') || !template.includes('<!--head-start-->')) {
  fail('Le gabarit dist/index.html ne contient pas les marqueurs attendus.');
}

const { render, routes, siteUrl, allowIndexing, noindexValue, netlifyHeaders } = await import(
  pathToFileURL(ssrEntry).href
);

/** Adresse publique attendue : https://domaine, sans chemin, ni exemple, ni adresse locale. */
function siteUrlProblem(url) {
  if (!url) return 'VITE_SITE_URL n’est pas définie';
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return `VITE_SITE_URL invalide (« ${url} »)`;
  }
  if (/(^|\.)example\.com$/i.test(parsed.hostname)) {
    return `VITE_SITE_URL est une adresse d’exemple (« ${url} »)`;
  }
  if (['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)) {
    return `VITE_SITE_URL pointe vers une adresse locale (« ${url} »)`;
  }
  if (parsed.protocol !== 'https:') return `VITE_SITE_URL doit commencer par https:// (« ${url} »)`;
  if (parsed.pathname !== '/' || parsed.search || parsed.hash) {
    return `VITE_SITE_URL ne doit contenir que le domaine, sans chemin (« ${url} »)`;
  }
  return null;
}

const urlProblem = siteUrlProblem(siteUrl);
if (urlProblem) guard(`${urlProblem}. Définissez l’adresse publique du site dans Netlify.`);

function page(path) {
  const { html, head } = render(path);
  return (
    template
      .replace(/<!--head-start-->[\s\S]*?<!--head-end-->/, head)
      // data-route : le navigateur vérifie que ce HTML correspond bien à l'adresse avant de l'hydrater.
      .replace('<div id="root">', `<div id="root" data-route="${path}">`)
      .replace('<!--app-html-->', html)
  );
}

function write(file, content) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content, 'utf8');
}

// Contrôle du noindex : impossible de publier une page indexable par erreur (et inversement).
const noindexTag = `<meta name="robots" content="${noindexValue}"`;
function checkRobots(path, html) {
  if (!allowIndexing && !html.includes(noindexTag)) {
    fail(`La page ${path} n’a pas la balise noindex alors que l’indexation est interdite.`);
  }
  if (allowIndexing && html.includes(noindexTag)) {
    fail(`La page ${path} est en noindex alors que VITE_ALLOW_INDEXING=true.`);
  }
}

let count = 0;
for (const route of routes) {
  const target =
    route.path === '/' ? join(dist, 'index.html') : join(dist, route.path.slice(1), 'index.html');
  const html = page(route.path);
  checkRobots(route.path, html);
  write(target, html);
  count++;
}
write(join(dist, '404.html'), page('/404'));

// Sitemap : uniquement les pages indexables.
const today = new Date().toISOString().slice(0, 10);
const urls = routes
  .filter((r) => !r.noindex)
  .map((r) => {
    const loc = r.path === '/' ? `${siteUrl}/` : `${siteUrl}${r.path}`;
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${(r.priority ?? 0.5).toFixed(1)}</priority>\n  </url>`;
  })
  .join('\n');
write(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);

// robots.txt : en préproduction, l'exploration reste permise pour que les moteurs lisent le noindex
// (une page bloquée par robots.txt ne voit jamais sa balise noindex) ; pas de sitemap annoncé.
write(
  join(dist, 'robots.txt'),
  allowIndexing
    ? `# Catalogue Express\nUser-agent: *\nAllow: /\nDisallow: /qa/\n\nSitemap: ${siteUrl}/sitemap.xml\n`
    : `# Catalogue Express — préproduction : toutes les pages sont en noindex\n# (balise robots + en-tête X-Robots-Tag).\nUser-agent: *\nAllow: /\nDisallow: /qa/\n`,
);

// En-têtes HTTP (sécurité, cache, noindex) : une seule méthode, le fichier _headers de Netlify.
write(join(dist, '_headers'), netlifyHeaders);

// Le bundle serveur ne sert qu'au pré-rendu : il n'est pas publié.
rmSync(join(root, 'dist-ssr'), { recursive: true, force: true });

// Balayage final : aucune URL d'exemple ne doit rester dans le site produit.
// (Les e-mails fictifs « …@example.com » des boutiques de démonstration ne sont pas des URL.)
const EXAMPLE_URL = /https?:\/\/(www\.)?example\.com/i;
const TEXT_FILES = new Set([
  '.html',
  '.js',
  '.css',
  '.xml',
  '.txt',
  '.json',
  '.webmanifest',
  '.svg',
  '',
]);
function scan(dir, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) scan(file, found);
    else if (TEXT_FILES.has(extname(entry.name)) && EXAMPLE_URL.test(readFileSync(file, 'utf8'))) {
      found.push(relative(dist, file));
    }
  }
  return found;
}
const leftovers = scan(dist);
if (leftovers.length > 0) {
  guard(
    `URL d’exemple (example.com) trouvée dans ${leftovers.length} fichier(s) : ${leftovers.slice(0, 5).join(', ')}`,
  );
}

console.log(
  `Pré-rendu terminé : ${count} pages + 404.html, sitemap.xml, robots.txt, _headers — ` +
    `indexation ${allowIndexing ? 'AUTORISÉE' : 'interdite (noindex)'} — site ${siteUrl}.`,
);
