// Outil de création : les scénarios du cahier des charges (section 12), dans un vrai navigateur.

import { expect, test } from '@playwright/test';
import {
  addProduct,
  expectNoHorizontalScroll,
  exportPdf,
  fillShopName,
  goToStep,
  isPhone,
  jpeg,
  loadDemo,
  makeImage,
  next,
  openCreator,
} from './helpers';

const desktopOnly = (name: string) => name !== 'ordinateur';

test.describe('validations (tous les écrans)', () => {
  test('nom de boutique obligatoire', async ({ page }) => {
    await openCreator(page);
    await next(page);
    await expect(page.getByText('Indiquez le nom de votre boutique.').first()).toBeVisible();
    await expect(page.locator('#shop-name')).toHaveAttribute('aria-invalid', 'true');
    await expect(page).toHaveURL(/\/creer$/);
    await expectNoHorizontalScroll(page);
  });

  test('scénario 1 — aucun produit : message clair et blocage', async ({ page }) => {
    await openCreator(page);
    await fillShopName(page);
    await next(page);
    await expect(page.getByRole('heading', { name: 'Vos produits' })).toBeVisible();
    await expect(page.getByText('Aucun produit pour l’instant')).toBeVisible();
    await next(page);
    await expect(
      page.getByRole('alert').filter({ hasText: 'Ajoutez au moins un produit pour continuer.' }),
    ).toBeVisible();
    await expect(page).toHaveURL(/etape=2/);
    await expectNoHorizontalScroll(page);
  });

  test('données d’exemple de la boutique', async ({ page }) => {
    await openCreator(page);
    await page.getByRole('button', { name: /Utiliser des données d’exemple/ }).click();
    await expect(page.locator('#shop-name')).toHaveValue('Boutique Mwinda');
  });
});

test.describe('parcours complet avec photos', () => {
  test('scénarios 2, 6–9, 11–19 : produits, photos, devise, logo, édition', async ({
    page,
  }, testInfo) => {
    test.skip(
      !['ordinateur', 'mobile-320', 'mobile-375'].includes(testInfo.project.name),
      'Parcours long : ordinateur + deux téléphones',
    );
    await openCreator(page);
    await fillShopName(page, 'Boutique Élégance Test');
    const logo = await makeImage(page, 300, 300, { type: 'image/png', color: '#2447D5' });
    await page
      .locator('#logo-input')
      .setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: logo });
    await expect(page.locator('.logo-preview img')).toBeVisible();
    await next(page);

    // Photos carrée, verticale, horizontale ; produit sans photo ; textes longs ; décimales.
    await addProduct(page, {
      name: 'Produit carré',
      price: '12,50',
      photo: jpeg('carre.jpg', await makeImage(page, 800, 800)),
    });
    await addProduct(page, {
      name: 'Produit vertical',
      price: '25',
      oldPrice: '30',
      category: 'Robes',
      photo: jpeg('vertical.jpg', await makeImage(page, 600, 1200, { color: '#1F8A4C' })),
    });
    await addProduct(page, {
      name: 'Produit horizontal',
      price: '7.99',
      category: 'Accessoires',
      photo: jpeg('horizontal.jpg', await makeImage(page, 1400, 600, { color: '#E67E22' })),
    });
    await addProduct(page, {
      name: 'Ensemble traditionnel brodé main en tissu wax premium avec accessoires assortis',
      price: '1250',
      description:
        'Très longue description pour vérifier que le texte ne déborde jamais de la fiche du catalogue : tissu, coupe, tailles, couleurs, entretien, livraison et retours, tout est détaillé ici.',
    });
    await expect(page.locator('.product-row')).toHaveCount(4);
    await expect(page.locator('.product-row').first()).toContainText('12,50 $');
    await expect(page.locator('.product-nophoto')).toHaveCount(1);
    await expectNoHorizontalScroll(page);

    // Duplication, suppression avec annulation, réorganisation.
    await page.getByRole('button', { name: 'Dupliquer Produit carré' }).click();
    await expect(page.locator('.product-row')).toHaveCount(5);
    await expect(page.locator('.product-name').nth(1)).toHaveText('Produit carré (copie)');
    await page.getByRole('button', { name: 'Supprimer Produit carré (copie)' }).click();
    await expect(page.locator('.product-row')).toHaveCount(4);
    await page.locator('.snackbar').getByRole('button', { name: 'Annuler' }).click();
    await expect(page.locator('.product-row')).toHaveCount(5);
    await page.getByRole('button', { name: 'Supprimer Produit carré (copie)' }).click();
    await expect(page.locator('.product-row')).toHaveCount(4);
    await page.getByRole('button', { name: 'Descendre Produit carré' }).click();
    await expect(page.locator('.product-name').nth(0)).toHaveText('Produit vertical');
    await expect(page.locator('.product-name').nth(1)).toHaveText('Produit carré');

    // Modification d'un produit.
    await page.locator('.product-main').filter({ hasText: 'Produit horizontal' }).click();
    const dialog = page.getByRole('dialog', { name: 'Modifier le produit' });
    await dialog.locator('#product-price').fill('8,49');
    await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click();
    await expect(
      page.locator('.product-row').filter({ hasText: 'Produit horizontal' }),
    ).toContainText('8,49 $');

    // Changement de devise (scénario 14).
    await goToStep(page, 1);
    await page.getByLabel('Devise').selectOption('CDF');
    await goToStep(page, 2);
    await expect(
      page.locator('.product-row').filter({ hasText: 'Produit horizontal' }),
    ).toContainText('8,49 FC');
    await expectNoHorizontalScroll(page);

    // Aperçu puis PDF (scénarios 28–29).
    await goToStep(page, 4);
    await expect(page.locator('.summary-grid')).toContainText('4');
    await expect(page.locator('.file-name').first()).toHaveText(
      /^catalogue-boutique-elegance-test-\d{4}-\d{2}-\d{2}\.pdf$/,
    );
    const { pdf, fileName } = await exportPdf(page, testInfo, `parcours-${testInfo.project.name}`);
    expect(fileName).toMatch(/^catalogue-boutique-elegance-test-\d{4}-\d{2}-\d{2}\.pdf$/);
    expect(pdf.getPageCount()).toBe(2);
    expect(pdf.getTitle()).toBe('Catalogue — Boutique Élégance Test');
    await expectNoHorizontalScroll(page);
  });

  test('scénario 10 — photo lourde (≈ 12 mégapixels) optimisée', async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo.project.name), 'Ordinateur uniquement (mémoire)');
    await openCreator(page);
    await fillShopName(page);
    await next(page);
    const heavy = await makeImage(page, 4000, 3000, { noise: true, quality: 0.95 });
    expect(heavy.length).toBeGreaterThan(2_000_000);
    await addProduct(page, { name: 'Photo lourde', price: '10', photo: jpeg('lourde.jpg', heavy) });
    await expect(page.locator('.product-thumb img')).toBeVisible();
    // L'image conservée est réduite (≤ 1600 px).
    const size = await page.evaluate(async () => {
      const db: IDBDatabase = await new Promise((res, rej) => {
        const r = indexedDB.open('catalogue-express');
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
      const all: { blob: Blob; width: number; height: number }[] = await new Promise((res) => {
        const req = db.transaction('images').objectStore('images').getAll();
        req.onsuccess = () => res(req.result);
      });
      return { width: all[0].width, height: all[0].height, bytes: all[0].blob.size };
    });
    expect(Math.max(size.width, size.height)).toBeLessThanOrEqual(1600);
    expect(size.bytes).toBeLessThan(heavy.length);
  });

  test('fichiers invalides : messages clairs', async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo.project.name), 'Ordinateur uniquement');
    await openCreator(page);
    await fillShopName(page);
    await next(page);
    await page.getByRole('button', { name: 'Ajouter un produit' }).click();
    const dialog = page.getByRole('dialog', { name: 'Ajouter un produit' });
    const input = dialog.locator('#product-photo-input');

    await input.setInputFiles({
      name: 'notes.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('bonjour'),
    });
    await expect(dialog.getByRole('alert')).toContainText('n’est pas une photo prise en charge');

    await input.setInputFiles({
      name: 'IMG_0001.HEIC',
      mimeType: 'image/heic',
      buffer: Buffer.from('heic'),
    });
    await expect(dialog.getByRole('alert')).toContainText('HEIC');

    await input.setInputFiles({
      name: 'abimee.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('ceci n’est pas une image'),
    });
    await expect(dialog.getByRole('alert')).toContainText('Impossible d’ouvrir');

    await input.setInputFiles({
      name: 'enorme.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.alloc(26 * 1024 * 1024),
    });
    await expect(dialog.getByRole('alert')).toContainText('trop lourde');

    // Nom et prix obligatoires.
    await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click();
    await expect(dialog.getByText('Le nom du produit est obligatoire.')).toBeVisible();
    await expect(dialog.getByText('Le prix est obligatoire.')).toBeVisible();
    await dialog.locator('#product-name').fill('Test');
    await dialog.locator('#product-price').fill('abc');
    await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click();
    await expect(dialog.getByText(/Prix invalide/)).toBeVisible();
  });
});

test.describe('modèles et export PDF', () => {
  const templates = [
    { name: 'Minimal clair', demo: 'epicerie' as const },
    { name: 'Mode élégante', demo: 'vetements' as const },
    { name: 'Cosmétiques moderne', demo: 'cosmetiques' as const },
    { name: 'Épicerie et restauration colorée', demo: 'restaurant' as const },
  ];

  for (const t of templates) {
    test(`scénarios 20–22 — ${t.name} en portrait et paysage`, async ({ page }, testInfo) => {
      test.skip(desktopOnly(testInfo.project.name), 'Ordinateur uniquement');
      await loadDemo(page, t.demo);
      await goToStep(page, 3);
      await page.getByRole('radio', { name: new RegExp(t.name) }).click();
      await expect(page.getByRole('radio', { name: new RegExp(t.name) })).toHaveAttribute(
        'aria-checked',
        'true',
      );
      await expect(page.locator('.live-pages svg')).toHaveCount(2);

      const portrait = await exportPdf(page, testInfo, `${t.demo}-portrait`);
      const p0 = portrait.pdf.getPage(0).getSize();
      expect([Math.round(p0.width), Math.round(p0.height)]).toEqual([595, 842]);

      await goToStep(page, 3);
      await page.getByText('A4 paysage').click();
      await goToStep(page, 4);
      const pagesShown = await page.locator('.preview-pages figure').count();
      const landscape = await exportPdf(page, testInfo, `${t.demo}-paysage`);
      const l0 = landscape.pdf.getPage(0).getSize();
      expect([Math.round(l0.width), Math.round(l0.height)]).toEqual([842, 595]);
      expect(landscape.pdf.getPageCount()).toBe(pagesShown);
    });
  }

  test('scénarios 4–5 — vingt puis cinquante produits avec photos', async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo.project.name), 'Ordinateur uniquement');
    test.setTimeout(240_000);
    await openCreator(page);
    await fillShopName(page, 'Grand Catalogue');
    await next(page);
    const colors = ['#C8416F', '#2447D5', '#1F8A4C', '#E67E22', '#7B3FA0'];
    const files = [];
    for (let i = 0; i < 50; i++)
      files.push(
        jpeg(`photo-${i + 1}.jpg`, await makeImage(page, 500, 500, { color: colors[i % 5] })),
      );
    await page.locator('#bulk-input').setInputFiles(files);
    await expect(page.locator('.product-row')).toHaveCount(50, { timeout: 120_000 });
    await expect(page.getByText('50 à compléter')).toBeVisible();

    // Les produits importés sont complétés (nom, prix) via les données enregistrées, puis rechargés.
    await page.waitForTimeout(800);
    await page.evaluate(() => {
      const key = 'catalogue-express:v1:catalog';
      const data = JSON.parse(localStorage.getItem(key)!);
      data.products = data.products.map((p: { name: string; price: number | null }, i: number) => ({
        ...p,
        name: `Article numéro ${i + 1}`,
        price: 5 + i * 0.5,
        category: i % 2 ? 'Pair' : 'Impair',
      }));
      localStorage.setItem(key, JSON.stringify(data));
    });
    await page.reload();
    await expect(page.locator('.product-row')).toHaveCount(50);
    await expect(page.locator('.product-row.is-incomplete')).toHaveCount(0);
    await expect(page.locator('.product-thumb img')).toHaveCount(50);

    // Filtre par catégorie.
    await page.getByRole('button', { name: 'Pair (25)', exact: true }).click();
    await expect(page.locator('.product-row')).toHaveCount(25);
    await page.getByRole('button', { name: /Toutes/ }).click();

    const { pdf } = await exportPdf(page, testInfo, 'cinquante-produits');
    // Minimal clair, 9 produits par page : couverture + 6 pages.
    expect(pdf.getPageCount()).toBe(7);
  });
});

test.describe('stockage local', () => {
  test('scénario 30 — sauvegarde, rechargement et effacement des données locales', async ({
    page,
  }, testInfo) => {
    test.skip(
      !['ordinateur', 'mobile-390'].includes(testInfo.project.name),
      'Ordinateur + un téléphone',
    );
    await openCreator(page);
    await fillShopName(page, 'Boutique Sauvegardée');
    await next(page);
    await addProduct(page, {
      name: 'Produit gardé',
      price: '15',
      photo: jpeg('p.jpg', await makeImage(page, 400, 400)),
    });
    await expect(page.getByText('Enregistré sur cet appareil')).toBeVisible();
    await page.waitForTimeout(800);
    await page.reload();
    await expect(page.locator('.product-row')).toHaveCount(1);
    await expect(page.locator('.product-thumb img')).toBeVisible();

    await page.getByRole('button', { name: /Données sur cet appareil/ }).click();
    await page.getByRole('button', { name: 'Effacer mes données locales' }).click();
    await page
      .getByRole('dialog', { name: 'Effacer toutes vos données ?' })
      .getByRole('button', { name: 'Effacer définitivement' })
      .click();
    await expect(page.locator('#shop-name')).toHaveValue('');
    const stored = await page.evaluate(() => localStorage.getItem('catalogue-express:v1:catalog'));
    expect(stored === null || !stored.includes('Produit gardé')).toBe(true);
    await page.reload();
    await goToStep(page, 2);
    await expect(page.getByText('Aucun produit pour l’instant')).toBeVisible();
  });

  test('« Recommencer » demande une confirmation', async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo.project.name), 'Ordinateur uniquement');
    await loadDemo(page, 'cosmetiques');
    await goToStep(page, 4);
    await page.getByRole('button', { name: 'Recommencer' }).click();
    const confirm = page.getByRole('dialog', { name: 'Recommencer à zéro ?' });
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.locator('.summary-grid')).toContainText('13');
    await page.getByRole('button', { name: 'Recommencer' }).click();
    await confirm.getByRole('button', { name: 'Oui, tout effacer' }).click();
    await expect(page).toHaveURL(/etape=1/);
    await expect(page.locator('#shop-name')).toHaveValue('');
  });

  test('offre Premium présentée honnêtement', async ({ page }, testInfo) => {
    test.skip(desktopOnly(testInfo.project.name), 'Ordinateur uniquement');
    await loadDemo(page, 'epicerie');
    await goToStep(page, 5);
    await page.getByRole('button', { name: 'Débloquer l’export complet' }).click();
    const dialog = page.getByRole('dialog', { name: 'L’export complet arrive bientôt' });
    await expect(dialog).toContainText('Le paiement n’est pas encore disponible.');
    await expect(dialog.locator('input')).toHaveCount(0);
  });
});

test('captures d’écran de contrôle (chaque écran)', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.screenshot({ path: testInfo.outputPath(`accueil-${testInfo.project.name}.png`) });
  await loadDemo(page, 'vetements');
  await page.screenshot({
    path: testInfo.outputPath(`produits-${testInfo.project.name}.png`),
    fullPage: false,
  });
  await expectNoHorizontalScroll(page);
  await goToStep(page, 3);
  await expectNoHorizontalScroll(page);
  await page.screenshot({
    path: testInfo.outputPath(`modele-${testInfo.project.name}.png`),
    fullPage: false,
  });
  await goToStep(page, 4);
  await expectNoHorizontalScroll(page);
  await page.screenshot({
    path: testInfo.outputPath(`apercu-${testInfo.project.name}.png`),
    fullPage: false,
  });
  await goToStep(page, 5);
  await expectNoHorizontalScroll(page);
  if (isPhone(testInfo)) {
    // La barre d'étapes du bas reste accessible au pouce.
    await expect(page.locator('.step-nav')).toBeVisible();
  }
});
