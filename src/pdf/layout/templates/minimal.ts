// Modèle 1 — Minimal clair : fond blanc, beaucoup d'air, filets fins, prix en couleur.

import { monthYearFr } from '../../../core/text';
import type { Product } from '../../../core/types';
import { TEMPLATE_META } from '../meta';
import { measureText, pdfText } from '../../measure';
import {
  bigTitle,
  contactItems,
  contactLine,
  contactList,
  coverImages,
  detailsText,
  line,
  mosaic,
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

const grid = TEMPLATE_META.minimal.grid;

function layout(input: LayoutInput): LayoutResult {
  const { settings, shop } = input;
  const size = pageSize(settings.orientation);
  const W = size.w;
  const H = size.h;
  const c = palette(shop.primaryColor);
  const d = settings.density;
  const portrait = settings.orientation === 'portrait';
  const M = 40;
  const contacts = settings.showContact ? contactItems(input) : [];

  // Styles des fiches selon la densité.
  const nameStyle: TextStyle = { font: 'helvetica-bold', size: pick(d, { large: 11.5, medium: 9.5, small: 8 }), color: c.ink };
  nameStyle.lineHeight = nameStyle.size * 1.22;
  const descStyle: TextStyle = { font: 'helvetica', size: pick(d, { large: 8.5, medium: 7.5, small: 6.5 }), color: c.muted };
  descStyle.lineHeight = descStyle.size * 1.3;
  const detailStyle: TextStyle = { font: 'helvetica', size: pick(d, { large: 7, medium: 6.5, small: 5.8 }), color: c.faint };
  const priceStyle: TextStyle = { font: 'helvetica-bold', size: pick(d, { large: 13, medium: 11, small: 9 }), color: c.primaryText };
  const oldStyle: TextStyle = { font: 'helvetica', size: priceStyle.size * 0.72, color: c.faint };
  const nameLines = 2;
  const descLines = settings.showDescription ? pick(d, { large: 3, medium: 2, small: 1 }) : 0;
  const detailLines = settings.showDetails ? 1 : 0;
  const pad = pick(d, { large: 9, medium: 7, small: 5 });
  const textH =
    pad +
    nameLines * nameStyle.lineHeight! +
    (descLines ? 3 + descLines * descStyle.lineHeight! : 0) +
    (detailLines ? 3 + detailStyle.size * 1.3 : 0) +
    5 +
    priceStyle.size * 1.1;

  const headerStyle: TextStyle = { font: 'helvetica-bold', size: 10, color: c.ink };
  const footerStyle: TextStyle = { font: 'helvetica', size: 7.5, color: c.muted };
  const content: Box = portrait
    ? { x: M, y: 86, w: W - 2 * M, h: H - 86 - 72 }
    : { x: M, y: 76, w: W - 2 * M, h: H - 76 - 62 };

  const drawCard = (ops: DrawOp[], product: Product, box: Box) => {
    const imgH = box.h - textH;
    const imgBox = { x: box.x, y: box.y, w: box.w, h: imgH };
    productImage(ops, input, product.imageId, imgBox, { bg: '#F3F4F6', placeholderFg: '#B7BCC7', r: 3 });
    const prices = priceTexts(product, input);
    if (prices.discount) {
      const fs = pick(d, { large: 8, medium: 7, small: 6 });
      const bw = measureText(prices.discount, 'helvetica-bold', fs) + fs * 1.2;
      ops.push({ kind: 'rect', x: box.x + 6, y: box.y + 6, w: bw, h: fs * 1.9, fill: c.primary, r: 2 });
      ops.push({ kind: 'text', x: box.x + 6 + fs * 0.6, y: box.y + 6 + fs * 1.3, text: prices.discount, font: 'helvetica-bold', size: fs, color: c.onPrimary });
    }
    let y = box.y + imgH + pad;
    y = paragraph(ops, product.name, box.x, y, box.w, nameStyle, nameLines);
    if (descLines && product.description.trim()) {
      y = paragraph(ops, product.description, box.x, y + 3, box.w, descStyle, descLines);
    }
    if (detailLines) {
      const details = detailsText(product);
      if (details) {
        y += 3;
        line(ops, details, box.x, y + detailStyle.size * 0.85, box.w, detailStyle);
      }
    }
    // Prix aligné en bas de la fiche : toutes les fiches d'une ligne sont alignées.
    const baseline = box.y + box.h - priceStyle.size * 0.22;
    const pw = line(ops, prices.price, box.x, baseline, box.w, priceStyle);
    if (prices.oldPrice) {
      const ow = measureText(prices.oldPrice, oldStyle.font, oldStyle.size);
      if (pw + 8 + ow <= box.w) struckText(ops, prices.oldPrice, box.x + pw + 7, baseline, oldStyle);
    }
    const link = productLink(input, product);
    if (link) ops.push({ kind: 'link', ...box, url: link });
  };

  const drawSectionHeader = (ops: DrawOp[], title: string, box: Box) => {
    const t = pdfText(title);
    line(ops, t, box.x, box.y + 15, box.w, { font: 'helvetica-bold', size: 12.5, color: c.ink });
    ops.push({ kind: 'rect', x: box.x, y: box.y + 21, w: 28, h: 2.5, fill: c.primary });
    ops.push({ kind: 'line', x1: box.x + 32, y1: box.y + 22.25, x2: box.x + box.w, y2: box.y + 22.25, color: c.line, width: 0.6 });
  };

  const drawHeader = (ops: DrawOp[]) => {
    const top = portrait ? 46 : 40;
    const titleW = measureText(settings.coverTitle, 'helvetica', 9);
    line(ops, shop.name, M, top, W - 2 * M - titleW - 20, headerStyle);
    line(ops, settings.coverTitle, M, top, W - 2 * M, { font: 'helvetica', size: 9, color: c.muted }, 'right');
    ops.push({ kind: 'rect', x: M, y: top + 9, w: 22, h: 2, fill: c.primary });
    ops.push({ kind: 'line', x1: M + 24, y1: top + 10, x2: W - M, y2: top + 10, color: c.line, width: 0.6 });
  };

  const drawFooter = (ops: DrawOp[], pageNumber: number, total: number) => {
    const y = H - (portrait ? 50 : 42);
    ops.push({ kind: 'line', x1: M, y1: y, x2: W - M, y2: y, color: c.line, width: 0.6 });
    const pageLabel = `${pageNumber} / ${total}`;
    const pw = measureText(pageLabel, 'helvetica-bold', 8);
    line(ops, pageLabel, M, y + 16, W - 2 * M, { font: 'helvetica-bold', size: 8, color: c.ink }, 'right');
    contactLine(ops, contacts, M, y + 16, W - 2 * M - pw - 24, footerStyle);
  };

  const cover = buildCover(input, W, H, c, contacts);

  return paginate(
    input,
    {
      pageBackground: '#FFFFFF',
      content,
      gapX: pick(d, { large: 20, medium: 16, small: 12 }),
      gapY: pick(d, { large: 20, medium: 16, small: 12 }),
      sectionHeaderHeight: 32,
      drawBackground: () => {},
      drawHeader,
      drawFooter,
      drawSectionHeader,
      drawCard,
    },
    grid(settings.orientation, d),
    cover,
    size,
  );
}

function buildCover(
  input: LayoutInput,
  W: number,
  H: number,
  c: ReturnType<typeof palette>,
  contacts: ReturnType<typeof contactItems>,
): LayoutPage {
  const { shop, settings } = input;
  const ops: DrawOp[] = [];
  const portrait = settings.orientation === 'portrait';
  const M = portrait ? 48 : 44;
  const textW = portrait ? W - 2 * M : W * 0.42 - M;
  let y = portrait ? 56 : 48;

  if (shop.logoId && input.availableImages.has(shop.logoId)) {
    ops.push({ kind: 'image', x: M, y, w: 58, h: 58, imageId: shop.logoId, fit: 'contain', bg: '#FFFFFF', r: 8 });
    y += 58 + 30;
  } else {
    y += portrait ? 34 : 20;
  }

  const label = `${settings.coverTitle} · ${monthYearFr(input.date)}`.toUpperCase();
  line(ops, label, M, y + 8, textW, { font: 'helvetica-bold', size: 9, color: c.primaryText, charSpace: 1.6 });
  y += 22;
  y = bigTitle(ops, shop.name, M, y, textW, { font: 'helvetica-bold', size: portrait ? 42 : 36, minSize: 22, color: c.ink, lineHeight: 1.05 });
  y += 14;
  ops.push({ kind: 'rect', x: M, y, w: 56, h: 4, fill: c.primary });
  y += 20;
  if (shop.slogan.trim()) {
    y = paragraph(ops, shop.slogan, M, y, textW, { font: 'helvetica', size: 13, color: c.muted, lineHeight: 17 }, 3);
  }

  const count = input.products.length;
  const countLabel = `${count} produit${count > 1 ? 's' : ''}`;
  const ids = coverImages(input, 4);

  if (portrait) {
    const bottomH = settings.showContact && contacts.length > 0 ? 170 : 90;
    const mTop = y + 28;
    const mBottom = H - bottomH - 20;
    const box = { x: M, y: mTop, w: W - 2 * M, h: Math.max(120, mBottom - mTop) };
    if (ids.length > 0) mosaic(ops, ids, box, 8, '#F3F4F6', 4);
    else coverFallback(ops, box, c, countLabel);
    coverBottom(ops, input, c, contacts, { x: M, y: H - bottomH, w: W - 2 * M, h: bottomH - 40 }, countLabel);
  } else {
    const box = { x: W * 0.46, y: 44, w: W * 0.54 - 44, h: H - 88 };
    if (ids.length > 0) mosaic(ops, ids, box, 8, '#F3F4F6', 4);
    else coverFallback(ops, box, c, countLabel);
    const bottomH = settings.showContact && contacts.length > 0 ? 150 : 60;
    coverBottom(ops, input, c, contacts, { x: M, y: H - bottomH - 20, w: textW, h: bottomH - 20 }, countLabel);
  }
  return { ops };
}

function coverFallback(ops: DrawOp[], box: Box, c: ReturnType<typeof palette>, countLabel: string) {
  ops.push({ kind: 'rect', ...box, fill: c.tint, r: 4 });
  line(ops, countLabel, box.x, box.y + box.h / 2 + 10, box.w, { font: 'helvetica-bold', size: 26, color: c.primaryText }, 'center');
}

function coverBottom(
  ops: DrawOp[],
  input: LayoutInput,
  c: ReturnType<typeof palette>,
  contacts: ReturnType<typeof contactItems>,
  box: Box,
  countLabel: string,
) {
  const portrait = input.settings.orientation === 'portrait';
  ops.push({ kind: 'line', x1: box.x, y1: box.y, x2: box.x + box.w, y2: box.y, color: c.line, width: 0.8 });
  const labelStyle: TextStyle = { font: 'helvetica-bold', size: 6.5, color: c.primaryText, charSpace: 1 };
  const valueStyle: TextStyle = { font: 'helvetica', size: 9.5, color: c.ink };
  if (input.settings.showContact && contacts.length > 0) {
    const colW = portrait ? (box.w - 20) / 3 : (box.w - 16) / 2;
    const perCol = portrait ? 2 : 3;
    const cols = portrait ? 3 : 2;
    for (let col = 0; col < cols; col++) {
      const items = contacts.slice(col * perCol, col * perCol + perCol);
      if (items.length === 0) break;
      contactList(ops, items, box.x + col * (colW + (portrait ? 10 : 16)), box.y + 16, colW, labelStyle, valueStyle, 8);
    }
    whatsappButton(ops, input, box.x, box.y + box.h - 26, { bg: c.primary, fg: c.onPrimary }, 9.5);
    line(ops, countLabel, box.x, box.y + box.h - 26 + 16, box.w, { font: 'helvetica', size: 9, color: c.muted }, 'right');
  } else {
    line(ops, countLabel, box.x, box.y + 22, box.w, { font: 'helvetica', size: 10, color: c.muted }, 'left');
  }
}

export const minimalTemplate: TemplateDefinition = { ...TEMPLATE_META.minimal, layout };
