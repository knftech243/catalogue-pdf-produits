import { expect, type Page, type TestInfo } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

export interface ImageOptions {
  color?: string;
  noise?: boolean;
  quality?: number;
  type?: 'image/jpeg' | 'image/png';
}

/** Crée une vraie image dans le navigateur (canvas) et la renvoie sous forme de fichier. */
export async function makeImage(
  page: Page,
  width: number,
  height: number,
  options: ImageOptions = {},
): Promise<Buffer> {
  const dataUrl = await page.evaluate(
    ({ width, height, color, noise, quality, type }) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, Math.min(width, height) / 4, 0, Math.PI * 2);
      ctx.fill();
      if (noise) {
        const img = ctx.getImageData(0, 0, width, height);
        for (let i = 0; i < img.data.length; i += 4) {
          const n = (Math.random() * 255) | 0;
          img.data[i] = n;
          img.data[i + 1] = (n * 7) & 255;
          img.data[i + 2] = (n * 13) & 255;
        }
        ctx.putImageData(img, 0, 0);
      }
      return canvas.toDataURL(type, quality);
    },
    {
      width,
      height,
      color: options.color ?? '#C8416F',
      noise: options.noise ?? false,
      quality: options.quality ?? 0.9,
      type: options.type ?? 'image/jpeg',
    },
  );
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

export const jpeg = (name: string, buffer: Buffer) => ({ name, mimeType: 'image/jpeg', buffer });

/** Ouvre l'outil sur un appareil « neuf » (aucune donnée locale). */
export async function openCreator(page: Page, query = '') {
  await page.goto(`/creer${query}`);
  await expect(page.getByRole('heading', { level: 1, name: 'Créer mon catalogue' })).toBeVisible();
}

export async function fillShopName(page: Page, name = 'Boutique Test') {
  await page.locator('#shop-name').fill(name);
}

export async function next(page: Page) {
  await page
    .locator('.step-nav')
    .getByRole('button', { name: /Suivant|Télécharger/ })
    .click();
}

export async function goToStep(page: Page, step: number) {
  await page.goto(`/creer?etape=${step}`);
  await expect(page.getByRole('heading', { level: 1, name: 'Créer mon catalogue' })).toBeVisible();
}

export interface ProductInput {
  name: string;
  price: string;
  oldPrice?: string;
  description?: string;
  category?: string;
  reference?: string;
  photo?: { name: string; mimeType: string; buffer: Buffer };
}

/** Ajoute un produit par la fenêtre « Ajouter un produit ». */
export async function addProduct(page: Page, p: ProductInput) {
  await page.getByRole('button', { name: 'Ajouter un produit' }).click();
  const dialog = page.getByRole('dialog', { name: 'Ajouter un produit' });
  await expect(dialog).toBeVisible();
  if (p.photo) {
    await dialog.locator('#product-photo-input').setInputFiles(p.photo);
    await expect(dialog.locator('.photo-preview img')).toBeVisible();
  }
  await dialog.locator('#product-name').fill(p.name);
  await dialog.locator('#product-price').fill(p.price);
  if (p.oldPrice) await dialog.locator('#product-old-price').fill(p.oldPrice);
  if (p.description) await dialog.getByLabel(/Description courte/).fill(p.description);
  if (p.category) await dialog.getByLabel(/Catégorie/).fill(p.category);
  if (p.reference) await dialog.getByLabel(/Référence/).fill(p.reference);
  await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(dialog).toBeHidden();
}

/** Charge une boutique exemple via l'URL (comme le bouton de la page Exemples). */
export async function loadDemo(
  page: Page,
  id: 'vetements' | 'cosmetiques' | 'restaurant' | 'epicerie',
) {
  await page.goto(`/creer?exemple=${id}`);
  await expect(page.getByRole('heading', { name: 'Vos produits' })).toBeVisible({
    timeout: 60_000,
  });
}

/** Crée le PDF à l'étape 5, le télécharge et le relit avec pdf-lib. */
export async function exportPdf(page: Page, testInfo: TestInfo, label: string) {
  await goToStep(page, 5);
  await page.getByRole('button', { name: /Créer mon PDF|Créer à nouveau le PDF/ }).click();
  const link = page.getByRole('link', { name: /Télécharger le PDF/ });
  await expect(link).toBeVisible({ timeout: 90_000 });
  const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
  const path = testInfo.outputPath(`${label}.pdf`);
  await download.saveAs(path);
  const { readFileSync } = await import('node:fs');
  const bytes = readFileSync(path);
  expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
  const pdf = await PDFDocument.load(bytes);
  return { fileName: download.suggestedFilename(), pdf, bytes };
}

/** Aucune barre de défilement horizontale. */
export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow, 'défilement horizontal').toBeLessThanOrEqual(1);
}

export function isPhone(testInfo: TestInfo) {
  return testInfo.project.name.startsWith('mobile');
}
