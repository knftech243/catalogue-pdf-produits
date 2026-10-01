// Pré-rendu statique (SEO) : génère le HTML de chaque page, la page 404, le sitemap et robots.txt.
// Exécuté automatiquement par `npm run build` après les builds client (dist/) et serveur (dist-ssr/).

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const ssrEntry = join(root, 'dist-ssr', 'entry-server.js');

if (!existsSync(ssrEntry)) {
  console.error('dist-ssr/entry-server.js introuvable : lancez `npm run build`.');
  process.exit(1);
}

const template = readFileSync(join(dist, 'index.html'), 'utf8');
if (!template.includes('<!--app-html-->') || !template.includes('<!--head-start-->')) {
  console.error('Le gabarit dist/index.html ne contient pas les marqueurs attendus.');
  process.exit(1);
}

const { render, routes, siteUrl } = await import(pathToFileURL(ssrEntry).href);

function page(path) {
  const { html, head } = render(path);
  return template
    .replace(/<!--head-start-->[\s\S]*?<!--head-end-->/, head)
    // data-route : le navigateur vérifie que ce HTML correspond bien à l'adresse avant de l'hydrater.
    .replace('<div id="root">', `<div id="root" data-route="${path}">`)
    .replace('<!--app-html-->', html);
}

function write(file, content) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content, 'utf8');
}

let count = 0;
for (const route of routes) {
  const target = route.path === '/' ? join(dist, 'index.html') : join(dist, route.path.slice(1), 'index.html');
  write(target, page(route.path));
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

write(
  join(dist, 'robots.txt'),
  `# Catalogue Express\nUser-agent: *\nAllow: /\nDisallow: /qa/\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
);

// Le bundle serveur ne sert qu'au pré-rendu : il n'est pas publié.
rmSync(join(root, 'dist-ssr'), { recursive: true, force: true });

if (siteUrl.includes('example.com')) {
  console.warn('⚠ VITE_SITE_URL n’est pas défini : sitemap et URL canoniques utilisent https://www.example.com.');
}
console.log(`Pré-rendu terminé : ${count} pages + 404.html, sitemap.xml, robots.txt.`);
