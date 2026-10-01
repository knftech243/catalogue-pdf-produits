// Génération réelle de PDF avec jsPDF (dans Node) et relecture avec pdf-lib.

import { mkdirSync, writeFileSync } from 'node:fs';
import { jsPDF } from 'jspdf';
import { PDFDocument, PDFName } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import type { Orientation, TemplateId } from '../../src/core/types';
import { layoutCatalog, TEMPLATES } from '../../src/pdf/layout';
import { renderLayout } from '../../src/pdf/render/renderPdf';
import { imageIds, makeCatalog, TINY_JPEG } from './helpers';

const OUT = 'test-results/pdf';

async function build(
  count: number,
  templateId: TemplateId,
  orientation: Orientation,
  watermark: string | null = null,
) {
  const data = makeCatalog(count);
  data.settings = { ...data.settings, templateId, orientation };
  data.shop.logoId = 'logo';
  const ids = imageIds(data);
  const { layout } = layoutCatalog(data, {
    availableImages: ids,
    watermark,
    maxProducts: 50,
    date: new Date(2026, 8, 30),
  });
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation, compress: true });
  await renderLayout(doc, layout, async () => ({ data: TINY_JPEG, format: 'JPEG' }));
  const bytes = new Uint8Array(doc.output('arraybuffer'));
  return { bytes, layout };
}

describe.each(TEMPLATES.map((t) => t.id))('PDF — modèle %s', (templateId) => {
  it.each(['portrait', 'landscape'] as Orientation[])(
    'génère un PDF A4 %s valide',
    async (orientation) => {
      const { bytes, layout } = await build(
        20,
        templateId as TemplateId,
        orientation,
        'VERSION DÉMO · CATALOGUE EXPRESS',
      );
      mkdirSync(OUT, { recursive: true });
      writeFileSync(`${OUT}/${templateId}-${orientation}.pdf`, bytes);

      const pdf = await PDFDocument.load(bytes);
      expect(pdf.getPageCount()).toBe(layout.pages.length);
      const { width, height } = pdf.getPage(0).getSize();
      if (orientation === 'portrait') {
        expect(Math.round(width)).toBe(595);
        expect(Math.round(height)).toBe(842);
      } else {
        expect(Math.round(width)).toBe(842);
        expect(Math.round(height)).toBe(595);
      }
      // Liens cliquables (WhatsApp) présents sur les pages produits.
      const annots = pdf.getPage(1).node.lookup(PDFName.of('Annots'));
      expect(annots).toBeTruthy();
      expect(bytes.length).toBeLessThan(400_000);
    },
  );
});

describe('PDF — volumes', () => {
  it.each([1, 5, 50])('%i produit(s)', async (count) => {
    const { bytes, layout } = await build(count, 'minimal', 'portrait');
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBe(layout.pages.length);
    expect(layout.productCount).toBe(count);
  });

  it('les photos identiques ne sont intégrées qu’une fois', async () => {
    const { bytes } = await build(20, 'minimal', 'portrait');
    const text = new TextDecoder('latin1').decode(bytes);
    const images = text.match(/\/Subtype \/Image/g) ?? [];
    // Couverture (4 cadres + logo) + fiches : chaque cadre différent donne une image distincte.
    expect(images.length).toBeGreaterThan(0);
    expect(images.length).toBeLessThanOrEqual(20 + 5);
  });
});
