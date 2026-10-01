// Site vitrine : chargement, SEO de base, accessibilité, liens internes, affichage sur chaque écran.

import { expect, test } from '@playwright/test';
import { expectNoHorizontalScroll, isPhone } from './helpers';

const PAGES = [
  { path: '/', h1: /Transformez vos photos produits/ },
  { path: '/creer', h1: 'Créer mon catalogue' },
  { path: '/modeles', h1: 'Quatre modèles de catalogues, quatre styles' },
  { path: '/exemples', h1: 'Des catalogues PDF prêts à partager' },
  { path: '/tarifs', h1: 'Commencez gratuitement' },
  { path: '/faq', h1: 'Questions fréquentes' },
  { path: '/contact', h1: 'Nous contacter' },
  { path: '/confidentialite', h1: 'Politique de confidentialité' },
  { path: '/conditions-utilisation', h1: 'Conditions d’utilisation' },
  { path: '/remboursement', h1: 'Politique de remboursement' },
  { path: '/mentions-legales', h1: 'Mentions légales' },
];

for (const { path, h1 } of PAGES) {
  test(`page ${path} : un seul H1, titre, description, sans erreur ni débordement`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(h1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/Catalogue Express/);
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description?.length ?? 0).toBeGreaterThan(50);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    // Toutes les images ont un texte alternatif (éventuellement vide si décoratives).
    const missingAlt = await page.locator('img:not([alt])').count();
    expect(missingAlt).toBe(0);
    // Tous les boutons ont un nom accessible.
    const unnamed = await page.evaluate(
      () =>
        [...document.querySelectorAll('button')].filter(
          (b) =>
            !(b.textContent?.trim() || b.getAttribute('aria-label') || b.getAttribute('title')),
        ).length,
    );
    expect(unnamed).toBe(0);
    await page.waitForLoadState('networkidle');
    await expectNoHorizontalScroll(page);
    expect(errors, errors.join('\n')).toEqual([]);
  });
}

test('les pages légales affichent la mention obligatoire', async ({ page }) => {
  for (const path of [
    '/confidentialite',
    '/conditions-utilisation',
    '/remboursement',
    '/mentions-legales',
  ]) {
    await page.goto(path);
    await expect(
      page.getByText(
        'Ce document est un modèle informatif à relire et adapter selon votre pays, votre activité et votre solution de paiement avant publication officielle.',
      ),
    ).toBeVisible();
  }
});

test('page 404 : statut 404 et liens de retour', async ({ page }) => {
  const response = await page.goto('/cette-page-n-existe-pas');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1, name: 'Page introuvable' })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await page.getByRole('link', { name: 'Retour à l’accueil' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('accueil : contenus obligatoires et navigation vers l’outil', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByText('Les premiers avis clients seront ajoutés ici après le lancement.'),
  ).toBeVisible();
  await expect(
    page
      .getByText(/Vos photos et les informations de vos produits restent sur votre appareil/)
      .first(),
  ).toBeVisible();
  await expect(page.locator('.faq-item')).toHaveCount(10);
  await page
    .getByRole('link', { name: /Créer mon catalogue gratuitement/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/creer$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Créer mon catalogue' })).toBeVisible();
});

test('navigation : menu principal (replié sur téléphone) et lien d’évitement', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Aller au contenu' })).toBeFocused();
  const nav = page.getByRole('navigation', { name: 'Navigation principale' });
  if (isPhone(testInfo) || testInfo.project.name === 'tablette') {
    await expect(nav.getByRole('link', { name: 'Tarifs' })).toBeHidden();
    await nav.getByRole('button', { name: 'Ouvrir le menu' }).click();
  }
  await nav.getByRole('link', { name: 'Tarifs' }).click();
  await expect(page).toHaveURL(/\/tarifs$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Commencez gratuitement' }),
  ).toBeVisible();
});

test('tous les liens internes répondent', async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== 'ordinateur', 'Vérification faite une seule fois');
  const links = new Set<string>();
  for (const { path } of PAGES) {
    await page.goto(path);
    for (const href of await page
      .locator('a[href^="/"]')
      .evaluateAll((as) => as.map((a) => a.getAttribute('href')!))) {
      links.add(href.split('#')[0]);
    }
  }
  for (const href of links) {
    const res = await request.get(href);
    expect(res.status(), href).toBe(200);
  }
  for (const file of [
    '/sitemap.xml',
    '/robots.txt',
    '/og-image.png',
    '/favicon.svg',
    '/manifest.webmanifest',
  ]) {
    expect((await request.get(file)).status(), file).toBe(200);
  }
});

test('aperçus des exemples chargés en différé', async ({ page }) => {
  await page.goto('/exemples');
  const imgs = page.locator('img.pdf-page');
  await expect(imgs).toHaveCount(8);
  await expect(imgs.first()).toHaveAttribute('loading', 'lazy');
  await imgs.last().scrollIntoViewIfNeeded();
  await expect
    .poll(() => imgs.last().evaluate((i: HTMLImageElement) => i.naturalWidth))
    .toBeGreaterThan(0);
});
