// Génère les démonstrations du dossier marketing/demos/ :
// - produits.json (données fictives), visuels/*.svg (illustrations), apercu-*.png (pages) ;
// - catalogue-*.pdf : vrai PDF créé par l'application, dans le navigateur installé (Edge).
//
// Prérequis : le site doit tourner en local (npm run build && npm run preview).
// Usage : npm run demo:pdf  (variable BASE_URL pour une autre adresse, http://localhost:4173 par défaut)

import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { createServer } from 'vite';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.BASE_URL || 'http://localhost:4173';
const outRoot = join(root, 'marketing', 'demos');

const vite = await createServer({
  root,
  logLevel: 'error',
  server: { middlewareMode: true, watch: null },
  appType: 'custom',
});
const { DEMO_SHOPS } = await vite.ssrLoadModule('/src/demo/shops.ts');
const { illustrationSvg } = await vite.ssrLoadModule('/src/demo/illustrations.ts');
const { renderDemoPageSvg, demoPageCount } = await vite.ssrLoadModule(
  '/src/demo/renderDemoPage.tsx',
);
const { slugify } = await vite.ssrLoadModule('/src/core/text.ts');
const { TEMPLATE_META } = await vite.ssrLoadModule('/src/pdf/layout/meta.ts');

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || 'msedge' });
const summary = [];

try {
  for (const demo of DEMO_SHOPS) {
    const dir = join(outRoot, demo.id);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(join(dir, 'visuels'), { recursive: true });

    // 1. Données produits (sans les paramètres de dessin).
    const products = demo.products.map((p) => ({
      nom: p.name,
      prix: p.price,
      ancienPrix: p.oldPrice ?? null,
      description: p.description,
      categorie: p.category,
      reference: p.reference ?? '',
      disponibilite: p.availability ?? '',
    }));
    writeFileSync(
      join(dir, 'produits.json'),
      JSON.stringify(
        { boutique: demo.shop, modele: demo.settings.templateId, produits: products },
        null,
        2,
      ) + '\n',
    );

    // 2. Visuels produits (illustrations vectorielles libres de droits, créées pour le projet).
    demo.products.forEach((p, i) => {
      const name = `${String(i + 1).padStart(2, '0')}-${slugify(p.name)}.svg`;
      writeFileSync(join(dir, 'visuels', name), illustrationSvg(p.art) + '\n');
    });

    // 3. Aperçus PNG des pages (même moteur que le PDF).
    const tab = await browser.newPage({
      viewport: { width: 595, height: 842 },
      deviceScaleFactor: 2,
    });
    const pages = demoPageCount(demo.id);
    for (let i = 0; i < Math.min(pages, 2); i++) {
      await tab.setContent(
        `<!doctype html><body style="margin:0">${renderDemoPageSvg(demo.id, i)}</body>`,
      );
      await tab.waitForTimeout(150);
      await tab.screenshot({
        path: join(dir, i === 0 ? 'apercu-couverture.png' : `apercu-page-${i + 1}.png`),
      });
    }
    await tab.close();

    // 4. Vrai PDF généré par l'application (parcours utilisateur complet).
    const context = await browser.newContext({
      acceptDownloads: true,
      viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(`${BASE}/creer?exemple=${demo.id}`);
    await page.getByRole('heading', { name: 'Vos produits' }).waitFor({ timeout: 60000 });
    await page.goto(`${BASE}/creer?etape=5`);
    await page.getByRole('button', { name: /Créer mon PDF/ }).click();
    const link = page.getByRole('link', { name: /Télécharger le PDF/ });
    await link.waitFor({ timeout: 120000 });
    const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
    const fileName = `catalogue-${slugify(demo.shop.name)}-demo.pdf`;
    await download.saveAs(join(dir, fileName));
    await context.close();

    // 5. Fiche de la démonstration.
    const readme = `# Démonstration — ${demo.label}

Boutique **fictive** : « ${demo.shop.name} » — ${demo.shop.slogan}.

| Élément | Valeur |
|---|---|
| Secteur | ${demo.sector} |
| Modèle | ${TEMPLATE_META[demo.settings.templateId].name} |
| Produits | ${demo.products.length} |
| Devise | ${demo.shop.currency.code} |
| Ville | ${demo.shop.address} |

## Fichiers

- \`${fileName}\` — catalogue PDF généré par l'application (export de démonstration gratuit, avec la
  mention « version démo »).
- \`apercu-couverture.png\`, \`apercu-page-2.png\` — aperçus des pages pour les réseaux sociaux.
- \`produits.json\` — données des produits (noms, prix, descriptions, catégories, disponibilités).
- \`visuels/\` — illustrations SVG des produits, dessinées pour le projet (libres d'utilisation dans la
  communication de Catalogue Express).

Les numéros de téléphone (+243 00…, +225 00…, +32 000…) et les adresses e-mail en \`example.com\` sont
volontairement factices : aucun lien du PDF ne mène à une vraie personne.

Pour régénérer : \`npm run build && npm run preview\`, puis \`npm run demo:pdf\` dans un autre terminal.
`;
    writeFileSync(join(dir, 'README.md'), readme);
    summary.push(`${demo.id}: ${demo.products.length} produits, ${pages} pages, ${fileName}`);
    console.log(`✓ ${demo.id}`);
  }
} finally {
  await browser.close();
  await vite.close();
}

console.log(summary.join('\n'));
