// Outil de contrôle visuel : capture une page (site ou visionneuse PDF) avec le navigateur installé.
// Usage : node scripts/qa-snap.mjs <url> <sortie.png> [largeur] [hauteur] [fullPage=1]

import { chromium } from '@playwright/test';

const [url, out, width = '1280', height = '900', full = '1'] = process.argv.slice(2);
if (!url || !out) {
  console.error('Usage : node scripts/qa-snap.mjs <url> <sortie.png> [largeur] [hauteur] [fullPage]');
  process.exit(1);
}

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || 'msedge' });
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(height) } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(url, { waitUntil: 'networkidle' });
if (url.includes('pdf-viewer')) {
  await page.waitForSelector('body[data-ready]', { timeout: 60000 });
}
await page.waitForTimeout(300);
await page.screenshot({ path: out, fullPage: full === '1' });
await browser.close();
if (errors.length) console.log('Erreurs console :\n' + errors.join('\n'));
console.log(`Capture enregistrée : ${out}`);
