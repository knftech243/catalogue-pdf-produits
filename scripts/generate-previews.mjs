// Génère les aperçus SVG des catalogues de démonstration (public/apercus/*.svg) affichés sur le site.
// Ils sont calculés avec le même moteur que le PDF, mais servis comme de simples images :
// la page d'accueil n'a pas besoin de charger le moteur de mise en page (bundle plus léger).
//
// Usage : npm run previews (lancé automatiquement par npm run build)

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'apercus');
mkdirSync(out, { recursive: true });

const vite = await createServer({ root, logLevel: 'error', server: { middlewareMode: true, watch: null }, appType: 'custom' });
try {
  const { renderDemoPageSvg } = await vite.ssrLoadModule('/src/demo/renderDemoPage.tsx');
  const demos = ['vetements', 'cosmetiques', 'restaurant', 'epicerie'];
  let count = 0;
  for (const id of demos) {
    for (const page of [0, 1, 2]) {
      const svg = renderDemoPageSvg(id, page);
      writeFileSync(join(out, `${id}-${page + 1}.svg`), `<?xml version="1.0" encoding="UTF-8"?>\n${svg}\n`, 'utf8');
      count++;
    }
  }
  console.log(`Aperçus générés : ${count} fichiers dans public/apercus/.`);
} finally {
  await vite.close();
}
