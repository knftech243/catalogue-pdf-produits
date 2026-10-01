// Modèle 3 — Cosmétiques moderne : fond teinté doux, cartes blanches arrondies, prix en pastille.

import { mix } from '../../../core/color';
import { monthYearFr } from '../../../core/text';
import type { Product } from '../../../core/types';
import { TEMPLATE_META } from '../meta';
import { measureText, pdfText } from '../../measure';
import {
  availabilityBadge,
  bigTitle,
  contactItems,
  contactLine,
  contactList,
  coverImages,
  line,
  pageSize,
  paginate,
  palette,
  paragraph,
  pick,
  priceTexts,
  productImage,
  productLink,
  struckText,
  whatsappButton,
  type TextStyle,
} from '../kit';
import type { Box, DrawOp, LayoutInput, LayoutPage, LayoutResult, TemplateDefinition } from '../types';

const INK = '#2A1F2D';
const MUTED = '#6F6475';

const grid = TEMPLATE_META.beauty.grid;

function layout(input: LayoutInput): LayoutResult {
  const { settings, shop } = input;
  const size = pageSize(settings.orientation);
  const W = size.w;
  const H = size.h;
  const pageBg = mix(shop.primaryColor, '#FFFFFF', 0.92);
  const c = palette(shop.primaryColor, '#FFFFFF');
  const d = settings.density;
  const portrait = settings.orientation === 'portrait';
  const M = 36;
  const contacts = settings.showContact ? contactItems(input) : [];

  const chipSize = pick(d, { large: 6.5, medium: 6, small: 5.4 });
  const nameStyle: TextStyle = { font: 'helvetica-bold', size: pick(d, { large: 11, medium: 9.2, small: 7.8 }), color: INK };
  nameStyle.lineHeight = nameStyle.size * 1.22;
  const descStyle: TextStyle = { font: 'helvetica', size: pick(d, { large: 8.3, medium: 7.3, small: 6.4 }), color: MUTED };
  descStyle.lineHeight = descStyle.size * 1.3;
  const priceSize = pick(d, { large: 11, medium: 9.5, small: 8 });
  const oldStyle: TextStyle = { font: 'helvetica', size: priceSize * 0.78, color: MUTED };
  const pad = pick(d, { large: 10, medium: 8, small: 6 });
  const radius = pick(d, { large: 14, medium: 12, small: 9 });
  const nameLines = 2;
  const descLines = settings.showDescription ? pick(d, { large: 3, medium: 2, small: 1 }) : 0;
  const pillH = priceSize * 2;
  const textH =
    pad +
    chipSize * 2.3 +
    4 +
    nameLines * nameStyle.lineHeight! +
    (descLines ? 2 + descLines * descStyle.lineHeight! : 0) +
    6 +
    pillH +
    pad;

  const content: Box = portrait
    ? { x: M, y: 84, w: W - 2 * M, h: H - 84 - 78 }
    : { x: M, y: 72, w: W - 2 * M, h: H - 72 - 66 };

  const drawCard = (ops: DrawOp[], product: Product, box: Box) => {
    // Ombre douce + carte blanche arrondie.
    ops.push({ kind: 'rect', x: box.x, y: box.y + 2, w: box.w, h: box.h, fill: c.dark, r: radius, opacity: 0.07 });
    ops.push({ kind: 'rect', ...box, fill: '#FFFFFF', r: radius });
    const inner = { x: box.x + pad, y: box.y + pad, w: box.w - 2 * pad, h: box.h - 2 * pad };
    const imgH = box.h - textH;
    productImage(ops, input, product.imageId, { x: inner.x, y: inner.y, w: inner.w, h: imgH }, { bg: c.tint, placeholderFg: c.tintStrong, r: radius - 4 });
    const prices = priceTexts(product, input);
    if (prices.discount) {
      const fs = chipSize + 0.6;
      const bw = measureText(prices.discount, 'helvetica-bold', fs) + fs * 1.6;
      ops.push({ kind: 'rect', x: inner.x + 6, y: inner.y + 6, w: bw, h: fs * 2, fill: c.primary, r: fs });
      ops.push({ kind: 'text', x: inner.x + 6 + fs * 0.8, y: inner.y + 6 + fs * 1.35, text: prices.discount, font: 'helvetica-bold', size: fs, color: c.onPrimary });
    }
    let y = inner.y + imgH + 4;
    // Pastille de catégorie.
    if (product.category && !settings.groupByCategory) {
      const label = product.category.toLocaleUpperCase('fr-FR');
      const maxW = inner.w;
      const tw = Math.min(measureText(label, 'helvetica-bold', chipSize, 0.6), maxW - chipSize * 1.6);
      ops.push({ kind: 'rect', x: inner.x, y, w: tw + chipSize * 1.6, h: chipSize * 1.9, fill: c.tint, r: chipSize });
      line(ops, label, inner.x + chipSize * 0.8, y + chipSize * 1.33, tw, { font: 'helvetica-bold', size: chipSize, color: c.primaryText, charSpace: 0.6 });
    }
    y += chipSize * 2.3 + 4;
    y = paragraph(ops, product.name, inner.x, y, inner.w, nameStyle, nameLines);
    if (descLines && product.description.trim()) {
      paragraph(ops, product.description, inner.x, y + 2, inner.w, descStyle, descLines);
    }
    // Pastille de prix en bas à gauche, disponibilité à droite.
    const py = box.y + box.h - pad - pillH;
    const priceW = Math.min(measureText(prices.price, 'helvetica-bold', priceSize) + priceSize * 1.8, inner.w);
    ops.push({ kind: 'rect', x: inner.x, y: py, w: priceW, h: pillH, fill: c.primary, r: pillH / 2 });
    line(ops, prices.price, inner.x, py + pillH / 2 + priceSize * 0.36, priceW, { font: 'helvetica-bold', size: priceSize, color: c.onPrimary }, 'center');
    // L'ancien prix est prioritaire sur la pastille de disponibilité s'il manque de place.
    let usedRight = inner.x + priceW;
    if (prices.oldPrice) {
      const ow = measureText(prices.oldPrice, oldStyle.font, oldStyle.size);
      if (usedRight + 6 + ow <= inner.x + inner.w) {
        struckText(ops, prices.oldPrice, usedRight + 6, py + pillH / 2 + oldStyle.size * 0.36, oldStyle);
        usedRight += 6 + ow;
      }
    }
    if (settings.showDetails && product.availability && d !== 'small') {
      const bw = measureText(pdfText(availabilityLabel(product.availability)), 'helvetica-bold', chipSize) + chipSize * 1.4;
      if (usedRight + 8 + bw <= inner.x + inner.w) {
        availabilityBadge(ops, product.availability, inner.x + inner.w, py + (pillH - chipSize * 1.8) / 2, chipSize, 'right');
      }
    }
    const link = productLink(input, product);
    if (link) ops.push({ kind: 'link', ...box, url: link });
  };

  const drawSectionHeader = (ops: DrawOp[], title: string, box: Box) => {
    const t = pdfText(title);
    const fs = 10.5;
    const w = Math.min(measureText(t, 'helvetica-bold', fs) + 26, box.w);
    ops.push({ kind: 'rect', x: box.x, y: box.y + 2, w, h: 22, fill: c.primary, r: 11 });
    line(ops, t, box.x + 13, box.y + 17, w - 26, { font: 'helvetica-bold', size: fs, color: c.onPrimary });
  };

  const drawBackground = (ops: DrawOp[]) => {
    ops.push({ kind: 'rect', x: 0, y: 0, w: W, h: H, fill: pageBg });
    ops.push({ kind: 'ellipse', cx: W - 30, cy: 20, rx: 90, ry: 90, fill: c.primary, opacity: 0.06 });
  };

  const drawHeader = (ops: DrawOp[]) => {
    const top = portrait ? 36 : 30;
    ops.push({ kind: 'ellipse', cx: M + 7, cy: top + 10, rx: 7, ry: 7, fill: c.primary });
    const label = settings.coverTitle;
    const lw = measureText(label, 'helvetica-bold', 8) + 22;
    line(ops, shop.name, M + 22, top + 14.5, W - 2 * M - lw - 40, { font: 'helvetica-bold', size: 13, color: INK });
    ops.push({ kind: 'rect', x: W - M - lw, y: top + 1, w: lw, h: 18, fill: '#FFFFFF', r: 9 });
    line(ops, label, W - M - lw, top + 13, lw, { font: 'helvetica-bold', size: 8, color: c.primaryText }, 'center');
  };

  const drawFooter = (ops: DrawOp[], pageNumber: number, total: number) => {
    const h = 26;
    const y = H - (portrait ? 58 : 52);
    const numW = 44;
    if (contacts.length > 0) {
      ops.push({ kind: 'rect', x: M, y, w: W - 2 * M - numW - 8, h, fill: '#FFFFFF', r: h / 2 });
      contactLine(ops, contacts, M + 14, y + h / 2 + 2.6, W - 2 * M - numW - 36, { font: 'helvetica', size: 7.5, color: MUTED }, 'center');
    }
    ops.push({ kind: 'rect', x: W - M - numW, y, w: numW, h, fill: c.primary, r: h / 2 });
    line(ops, `${pageNumber}/${total}`, W - M - numW, y + h / 2 + 2.8, numW, { font: 'helvetica-bold', size: 8, color: c.onPrimary }, 'center');
  };

  return paginate(
    input,
    {
      pageBackground: pageBg,
      content,
      gapX: pick(d, { large: 16, medium: 12, small: 9 }),
      gapY: pick(d, { large: 16, medium: 12, small: 9 }),
      sectionHeaderHeight: 32,
      drawBackground,
      drawHeader,
      drawFooter,
      drawSectionHeader,
      drawCard,
    },
    grid(settings.orientation, d),
    buildCover(input, W, H, pageBg, c, contacts),
    size,
  );
}

function availabilityLabel(a: Product['availability']): string {
  return { '': '', in_stock: 'En stock', limited: 'Stock limité', on_order: 'Sur commande', sold_out: 'Épuisé' }[a];
}

function buildCover(
  input: LayoutInput,
  W: number,
  H: number,
  pageBg: string,
  c: ReturnType<typeof palette>,
  contacts: ReturnType<typeof contactItems>,
): LayoutPage {
  const { shop, settings } = input;
  const portrait = settings.orientation === 'portrait';
  const ops: DrawOp[] = [{ kind: 'rect', x: 0, y: 0, w: W, h: H, fill: pageBg }];
  const ids = coverImages(input, 3);

  // Formes décoratives.
  ops.push({ kind: 'ellipse', cx: W * 0.86, cy: H * 0.08, rx: W * 0.36, ry: W * 0.36, fill: c.primary, opacity: 0.1 });
  ops.push({ kind: 'ellipse', cx: W * 0.05, cy: H * 0.95, rx: W * 0.22, ry: W * 0.22, fill: c.primary, opacity: 0.07 });

  // Photo principale ronde + deux petites.
  const R = portrait ? W * 0.29 : H * 0.3;
  const hcx = portrait ? W * 0.6 : W * 0.7;
  const hcy = portrait ? H * 0.3 : H * 0.45;
  ops.push({ kind: 'ellipse', cx: hcx, cy: hcy, rx: R + 10, ry: R + 10, fill: '#FFFFFF' });
  if (ids[0]) {
    ops.push({ kind: 'image', x: hcx - R, y: hcy - R, w: 2 * R, h: 2 * R, imageId: ids[0], fit: 'cover', bg: c.tint, shape: 'circle' });
  } else {
    ops.push({ kind: 'ellipse', cx: hcx, cy: hcy, rx: R, ry: R, fill: c.tintStrong });
    line(ops, pdfText(shop.name.charAt(0).toUpperCase() || 'C'), hcx - R, hcy + 34, 2 * R, { font: 'helvetica-bold', size: 96, color: '#FFFFFF' }, 'center');
  }
  const r2 = R * 0.38;
  const small = [
    { cx: hcx - R * 0.98, cy: hcy + R * 0.72 },
    { cx: hcx + R * 0.92, cy: hcy + R * 0.9 },
  ];
  ids.slice(1, 3).forEach((id, i) => {
    const p = small[i];
    ops.push({ kind: 'ellipse', cx: p.cx, cy: p.cy, rx: r2 + 5, ry: r2 + 5, fill: '#FFFFFF' });
    ops.push({ kind: 'image', x: p.cx - r2, y: p.cy - r2, w: 2 * r2, h: 2 * r2, imageId: id, fit: 'cover', bg: c.tint, shape: 'circle' });
  });

  // Logo en haut à gauche.
  const M = 44;
  if (shop.logoId && input.availableImages.has(shop.logoId)) {
    ops.push({ kind: 'ellipse', cx: M + 30, cy: 70, rx: 34, ry: 34, fill: '#FFFFFF' });
    ops.push({ kind: 'image', x: M, y: 40, w: 60, h: 60, imageId: shop.logoId, fit: 'contain', bg: '#FFFFFF', shape: 'circle' });
  }

  // Bloc titre.
  const textX = M;
  const textW = portrait ? W - 2 * M : W * 0.46;
  let y = portrait ? H * 0.56 : H * 0.3;
  const chip = `${settings.coverTitle} · ${monthYearFr(input.date)}`;
  const cw = Math.min(measureText(chip, 'helvetica-bold', 8.5) + 24, textW);
  ops.push({ kind: 'rect', x: textX, y, w: cw, h: 20, fill: '#FFFFFF', r: 10 });
  line(ops, chip, textX + 12, y + 13.5, cw - 24, { font: 'helvetica-bold', size: 8.5, color: c.primaryText });
  y += 34;
  y = bigTitle(ops, shop.name, textX, y, textW, { font: 'helvetica-bold', size: portrait ? 40 : 34, minSize: 20, color: INK, lineHeight: 1.05 });
  y += 10;
  if (shop.slogan.trim()) y = paragraph(ops, shop.slogan, textX, y, textW * 0.92, { font: 'helvetica', size: 13, color: MUTED, lineHeight: 17 }, 3);

  // Carte contacts.
  if (settings.showContact && contacts.length > 0) {
    const cardH = portrait ? 118 : 110;
    const cardY = H - cardH - (portrait ? 44 : 36);
    const cardW = portrait ? W - 2 * M : textW;
    ops.push({ kind: 'rect', x: M, y: cardY, w: cardW, h: cardH, fill: '#FFFFFF', r: 16 });
    const colW = (cardW - 48) / (portrait ? 3 : 2);
    const per = portrait ? 2 : 2;
    const cols = portrait ? 3 : 2;
    for (let i = 0; i < cols; i++) {
      const items = contacts.slice(i * per, i * per + per);
      if (!items.length) break;
      contactList(ops, items, M + 18 + i * (colW + 6), cardY + 16, colW, { font: 'helvetica-bold', size: 6.5, color: c.primaryText, charSpace: 0.8 }, { font: 'helvetica', size: 9.5, color: INK }, 6);
    }
    whatsappButton(ops, input, M + 18, cardY + cardH - 34, { bg: c.primary, fg: c.onPrimary }, 9);
  }
  return { ops };
}

export const beautyTemplate: TemplateDefinition = { ...TEMPLATE_META.beauty, layout };
