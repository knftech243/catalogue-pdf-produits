// Audit d'accessibilité automatisé (axe-core, règles WCAG 2.1 A et AA).

import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { goToStep, loadDemo } from './helpers';

const PAGES = [
  '/',
  '/modeles',
  '/exemples',
  '/tarifs',
  '/faq',
  '/contact',
  '/confidentialite',
  '/conditions-utilisation',
  '/remboursement',
  '/mentions-legales',
  '/page-inexistante',
];

async function audit(page: Page, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const summary = results.violations.map(
    (v) =>
      `${label} — ${v.id} (${v.impact}) : ${v.help}\n   ${v.nodes
        .map((n) => n.target.join(' '))
        .slice(0, 5)
        .join('\n   ')}`,
  );
  expect(results.violations, summary.join('\n')).toEqual([]);
}

test.describe('accessibilité (axe-core, WCAG 2.1 AA)', () => {
  test.beforeEach(async ({ page: _page }, testInfo) => {
    test.skip(
      !['ordinateur', 'mobile-375'].includes(testInfo.project.name),
      'Ordinateur + un téléphone',
    );
  });

  for (const path of PAGES) {
    test(`page ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await audit(page, path);
    });
  }

  test('outil de création : les 5 étapes et la fenêtre produit', async ({ page }) => {
    await page.goto('/creer');
    await expect(page.locator('#shop-name')).toBeVisible();
    await audit(page, 'étape 1');
    await loadDemo(page, 'cosmetiques');
    await audit(page, 'étape 2');
    await page.getByRole('button', { name: 'Ajouter un produit' }).click();
    await expect(page.getByRole('dialog', { name: 'Ajouter un produit' })).toBeVisible();
    await audit(page, 'fenêtre produit');
    await page.keyboard.press('Escape');
    for (const step of [3, 4, 5]) {
      await goToStep(page, step);
      await audit(page, `étape ${step}`);
    }
  });
});
