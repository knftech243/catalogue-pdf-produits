// Génère les images publiques de la marque : icônes PNG (application, Apple) et image Open Graph.
// Les visuels sont dessinés localement (SVG du logo + vraies pages de catalogue de démonstration),
// puis convertis en PNG avec le navigateur installé (Edge par défaut). Aucun téléchargement externe.
//
// Usage : npm run brand:assets

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { createServer } from 'vite';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const mark = readFileSync(join(root, 'branding', 'logo-mark.svg'), 'utf8');

// Rendu serveur des vraies pages de démonstration (même moteur que le PDF).
const vite = await createServer({
  root,
  logLevel: 'error',
  server: { middlewareMode: true, watch: null },
  appType: 'custom',
});
const { renderDemoPageSvg } = await vite.ssrLoadModule('/src/demo/renderDemoPage.tsx');
const page = (demoId, index) => renderDemoPageSvg(demoId, index);
const coverFashion = page('vetements', 0);
const pageFood = page('restaurant', 1);
const coverBeauty = page('cosmetiques', 0);
await vite.close();

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || 'msedge' });
const tab = await browser.newPage();

async function snap(html, width, height, out) {
  await tab.setViewportSize({ width, height });
  await tab.setContent(html, { waitUntil: 'load' });
  await tab.waitForTimeout(150);
  await tab.screenshot({ path: join(root, out), omitBackground: false });
  console.log(`✓ ${out}`);
}

const iconHtml = (
  size,
  padding,
  bg,
) => `<!doctype html><html><body style="margin:0;background:${bg};display:grid;place-items:center;width:${size}px;height:${size}px">
<div style="width:${size - 2 * padding}px;height:${size - 2 * padding}px">${mark.replace('width="48" height="48"', 'width="100%" height="100%"')}</div></body></html>`;

await snap(iconHtml(180, 0, '#FF7A1A'), 180, 180, 'public/apple-touch-icon.png');
await snap(iconHtml(192, 0, '#FF7A1A'), 192, 192, 'public/icon-192.png');
// Icône « maskable » : marge de sécurité pour les formes rondes d'Android.
await snap(iconHtml(512, 64, '#FF7A1A'), 512, 512, 'public/icon-512.png');
await snap(iconHtml(32, 0, '#FF7A1A'), 32, 32, 'public/favicon-32.png');

const og = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>
  *{box-sizing:border-box} body{margin:0;width:1200px;height:630px;overflow:hidden;font-family:"Segoe UI",Roboto,Arial,sans-serif;color:#1B1F3B;
  background:radial-gradient(70% 90% at 100% 0%,#FFD9BA 0%,transparent 60%),radial-gradient(50% 60% at 0% 100%,#E9EBFF 0%,transparent 60%),#FFFAF4}
  .left{position:absolute;left:72px;top:64px;width:600px}
  .brand{display:flex;align-items:center;gap:14px;font-weight:800;font-size:30px;letter-spacing:-.5px}
  .brand svg{width:56px;height:56px} .brand span{color:#FF7A1A}
  h1{font-size:58px;line-height:1.06;letter-spacing:-1.5px;margin:44px 0 22px;font-weight:800}
  h1 em{font-style:normal;background:linear-gradient(transparent 62%,#FFC999 62%)}
  p{font-size:26px;margin:0;color:#353A5C;font-weight:600}
  .pills{display:flex;gap:12px;margin-top:34px}
  .pill{background:#1B1F3B;color:#fff;border-radius:999px;padding:10px 18px;font-size:20px;font-weight:700}
  .pill.o{background:#FF7A1A;color:#1B1F3B}
  .pg{position:absolute;background:#fff;box-shadow:0 26px 60px -20px rgba(27,31,59,.45);border-radius:6px;overflow:hidden}
  .pg figure{margin:0} .pg figcaption{display:none} .pg svg{display:block;width:100%;height:auto}
  .p1{width:300px;right:70px;top:46px;transform:rotate(5deg)}
  .p2{width:270px;right:300px;top:250px;transform:rotate(-7deg)}
  .p3{width:230px;right:-40px;top:330px;transform:rotate(9deg)}
</style></head><body>
<div class="left">
  <div class="brand">${mark}<div>Catalogue<span>Express</span></div></div>
  <h1>Vos photos produits deviennent un <em>catalogue PDF</em> professionnel</h1>
  <p>Prix, descriptions, coordonnées : prêt à envoyer sur WhatsApp.</p>
  <div class="pills"><span class="pill o">Gratuit</span><span class="pill">Sans inscription</span><span class="pill">Sur téléphone</span></div>
</div>
<div class="pg p2">${pageFood}</div>
<div class="pg p3">${coverBeauty}</div>
<div class="pg p1">${coverFashion}</div>
</body></html>`;
await snap(og, 1200, 630, 'public/og-image.png');

await browser.close();
