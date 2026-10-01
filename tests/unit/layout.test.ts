// Tests du moteur de mise en page : pagination, débordements, chevauchements, pour chaque modèle.

import { describe, expect, it } from 'vitest';
import type { Density, Orientation, TemplateId } from '../../src/core/types';
import { layoutCatalog, productsPerPage, TEMPLATES } from '../../src/pdf/layout';
import type { DrawOp, LayoutResult } from '../../src/pdf/layout/types';
import { measureText } from '../../src/pdf/measure';
import { imageIds, makeCatalog, makeProducts } from './helpers';

const TEMPLATE_IDS = TEMPLATES.map((t) => t.id) as TemplateId[];
const ORIENTATIONS: Orientation[] = ['portrait', 'landscape'];
const DENSITIES: Density[] = ['large', 'medium', 'small'];

function run(
  count: number,
  templateId: TemplateId,
  orientation: Orientation,
  density: Density = 'medium',
  extra = {},
) {
  const data = makeCatalog(count);
  data.settings = { ...data.settings, templateId, orientation, density, ...extra };
  return layoutCatalog(data, {
    availableImages: imageIds(data),
    watermark: null,
    maxProducts: 50,
    date: new Date(2026, 8, 30),
  });
}

function textOps(layout: LayoutResult, page: number) {
  return layout.pages[page].ops.filter(
    (o): o is Extract<DrawOp, { kind: 'text' }> => o.kind === 'text',
  );
}

function overlaps(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) {
  const eps = 0.5;
  return (
    a.x + a.w - eps > b.x && b.x + b.w - eps > a.x && a.y + a.h - eps > b.y && b.y + b.h - eps > a.y
  );
}

describe.each(TEMPLATE_IDS)('modèle %s', (templateId) => {
  describe.each(ORIENTATIONS)('%s', (orientation) => {
    it.each([1, 5, 20, 50])('%i produit(s) : pagination correcte', (count) => {
      const { layout, productCount } = run(count, templateId, orientation);
      const perPage = productsPerPage(templateId, orientation, 'medium');
      expect(productCount).toBe(count);
      // Couverture + pages nécessaires (sans regroupement par catégorie).
      expect(layout.pages.length).toBe(1 + Math.ceil(count / perPage));
      const size = orientation === 'portrait' ? [595.28, 841.89] : [841.89, 595.28];
      expect([layout.width, layout.height]).toEqual(size);
    });

    it('aucun texte ne sort de la page', () => {
      const { layout } = run(20, templateId, orientation);
      layout.pages.forEach((_page, i) => {
        for (const op of textOps(layout, i)) {
          if (op.angle) continue; // filigrane : volontairement en diagonale
          const w = measureText(op.text, op.font, op.size, op.charSpace ?? 0);
          expect(op.x, `page ${i + 1} « ${op.text} »`).toBeGreaterThanOrEqual(-0.5);
          expect(op.x + w, `page ${i + 1} « ${op.text} »`).toBeLessThanOrEqual(layout.width + 0.5);
          expect(op.y).toBeGreaterThan(0);
          expect(op.y).toBeLessThanOrEqual(layout.height);
        }
      });
    });

    it('les fiches produits ne se chevauchent pas', () => {
      const { layout } = run(20, templateId, orientation);
      for (let i = 1; i < layout.pages.length; i++) {
        const links = layout.pages[i].ops.filter(
          (o) => o.kind === 'link' && o.url.includes('?text='),
        );
        for (let a = 0; a < links.length; a++)
          for (let b = a + 1; b < links.length; b++) {
            expect(overlaps(links[a] as never, links[b] as never)).toBe(false);
          }
      }
    });

    it('numérote les pages « n / total »', () => {
      const { layout } = run(20, templateId, orientation);
      const total = layout.pages.length;
      for (let i = 1; i < total; i++) {
        const texts = textOps(layout, i).map((t) => t.text.replace(/\s/g, ''));
        expect(texts).toContain(`${i + 1}/${total}`);
      }
    });

    it.each(DENSITIES)('densité %s : fonctionne avec 50 produits', (density) => {
      const { layout, productCount } = run(50, templateId, orientation, density);
      expect(productCount).toBe(50);
      const perPage = productsPerPage(templateId, orientation, density);
      expect(layout.pages.length).toBe(1 + Math.ceil(50 / perPage));
    });
  });

  it('regroupe par catégorie avec des intertitres', () => {
    const { layout } = run(12, templateId, 'portrait', 'medium', { groupByCategory: true });
    const all = layout.pages.slice(1).flatMap((p) => p.ops);
    const texts = all
      .filter((o) => o.kind === 'text')
      .map((o) => (o as { text: string }).text.toUpperCase());
    for (const cat of ['ROBES', 'CHAUSSURES', 'ACCESSOIRES', 'BOISSONS']) {
      expect(texts.some((t) => t.includes(cat))).toBe(true);
    }
  });

  it('gère un nom et une description très longs sans débordement', () => {
    const data = makeCatalog(3);
    data.products[0].name =
      'Ensemble traditionnel brodé main en tissu wax premium avec accessoires assortis pour cérémonie';
    data.products[0].description =
      'Description très détaillée : '.repeat(12) +
      'fin du texte qui ne doit jamais apparaître en entier dans la fiche.';
    data.settings.templateId = templateId;
    const { layout } = layoutCatalog(data, {
      availableImages: imageIds(data),
      watermark: null,
      maxProducts: 50,
    });
    const texts = textOps(layout, 1).map((t) => t.text);
    expect(texts.some((t) => t.endsWith('…'))).toBe(true);
    expect(texts.some((t) => t.includes('fin du texte'))).toBe(false);
  });

  it('affiche la devise choisie', () => {
    const data = makeCatalog(2);
    data.settings.templateId = templateId;
    data.shop.currency = { code: 'CDF', customSymbol: '', customPosition: 'after' };
    const { layout } = layoutCatalog(data, {
      availableImages: new Set(),
      watermark: null,
      maxProducts: 50,
    });
    const texts = textOps(layout, 1).map((t) => t.text);
    expect(texts.some((t) => t.endsWith('FC'))).toBe(true);
  });

  it('ajoute le filigrane de démonstration sur chaque page', () => {
    const data = makeCatalog(8);
    data.settings.templateId = templateId;
    const { layout } = layoutCatalog(data, {
      availableImages: imageIds(data),
      watermark: 'VERSION DÉMO',
      maxProducts: 50,
    });
    for (const page of layout.pages) {
      expect(page.ops.some((o) => o.kind === 'text' && o.text === 'VERSION DÉMO')).toBe(true);
    }
  });

  it('fonctionne sans photo, sans logo et sans contact', () => {
    const data = makeCatalog(4);
    data.settings.templateId = templateId;
    data.settings.showContact = false;
    data.products = makeProducts(4, { imageId: null });
    const { layout } = layoutCatalog(data, {
      availableImages: new Set(),
      watermark: null,
      maxProducts: 50,
    });
    expect(layout.pages.length).toBe(2);
    expect(layout.pages.flatMap((p) => p.ops).some((o) => o.kind === 'image')).toBe(false);
    const texts = layout.pages
      .flatMap((p) => p.ops)
      .filter((o) => o.kind === 'text')
      .map((o) => (o as { text: string }).text);
    expect(texts.some((t) => t.includes('Photo à venir'))).toBe(true);
    expect(texts.some((t) => t.includes('test@example.com'))).toBe(false);
  });

  it('affiche le logo sur la couverture', () => {
    const data = makeCatalog(4);
    data.settings.templateId = templateId;
    data.shop.logoId = 'logo1';
    const { layout } = layoutCatalog(data, {
      availableImages: imageIds(data),
      watermark: null,
      maxProducts: 50,
    });
    expect(layout.pages[0].ops.some((o) => o.kind === 'image' && o.imageId === 'logo1')).toBe(true);
  });
});

describe('règles communes', () => {
  it('exclut les produits incomplets et applique la limite', () => {
    const data = makeCatalog(60);
    data.products[0].name = '';
    data.products[1].price = null;
    const res = layoutCatalog(data, {
      availableImages: new Set(),
      watermark: null,
      maxProducts: 50,
    });
    expect(res.incompleteCount).toBe(2);
    expect(res.productCount).toBe(50);
    expect(res.overLimitCount).toBe(8);
  });

  it('zéro produit : seulement la couverture', () => {
    const res = layoutCatalog(makeCatalog(0), {
      availableImages: new Set(),
      watermark: null,
      maxProducts: 50,
    });
    expect(res.productCount).toBe(0);
    expect(res.layout.pages).toHaveLength(1);
  });

  it('trie par prix sans modifier l’ordre manuel', () => {
    const data = makeCatalog(5);
    data.settings.sort = 'price-desc';
    const res = layoutCatalog(data, {
      availableImages: new Set(),
      watermark: null,
      maxProducts: 50,
    });
    expect(res.productCount).toBe(5);
    expect(data.products[0].id).toBe('p1');
  });

  it('crée des liens WhatsApp avec message pour chaque produit', () => {
    const data = makeCatalog(3);
    const { layout } = layoutCatalog(data, {
      availableImages: new Set(),
      watermark: null,
      maxProducts: 50,
    });
    const links = layout.pages[1].ops
      .filter((o) => o.kind === 'link')
      .map((o) => (o as { url: string }).url);
    expect(links.filter((u) => u.startsWith('https://wa.me/243000000000?text='))).toHaveLength(3);
    data.settings.whatsappLinks = false;
    const off = layoutCatalog(data, {
      availableImages: new Set(),
      watermark: null,
      maxProducts: 50,
    });
    expect(
      off.layout.pages
        .flatMap((p) => p.ops)
        .some((o) => o.kind === 'link' && o.url.includes('wa.me')),
    ).toBe(false);
  });

  it('retire les émojis et le signale', () => {
    const data = makeCatalog(1);
    data.products[0].name = 'Promo 🔥 robe';
    const res = layoutCatalog(data, {
      availableImages: new Set(),
      watermark: null,
      maxProducts: 50,
    });
    expect(res.removedCharacters).toBe(true);
  });
});
