// Modèle 4 — Épicerie et restauration colorée : bandeau de couleur, fiches horizontales,
// prix en étiquette jaune bien visible. Pensé pour les menus et les listes de prix.

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
  detailsText,
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

const INK = '#1E1B18';
const MUTED = '#5F5850';
const STICKER = '#FFC933';
const CARD_BG = '#FFFBF5';
const CARD_LINE = '#EFE6DA';

const grid = TEMPLATE_META.food.grid;

function layout(input: LayoutInput): LayoutResult {
  const { settings, shop } = input;
  const size = pageSize(settings.orientation);
  const W = size.w;
  const H = size.h;
  const c = palette(shop.primaryColor);
  const d = settings.density;
  const portrait = settings.orientation === 'portrait';
  const M = 34;
  const contacts = settings.showContact ? contactItems(input) : [];
  const g = grid(settings.orientation, d);
  const compact = g.cols > 1 && d === 'small';

  const nameStyle: TextStyle = { font: 'helvetica-bold', size: pick(d, { large: 12.5, medium: 10, small: 8.6 }), color: INK };
  nameStyle.lineHeight = nameStyle.size * 1.2;
  const descStyle: TextStyle = { font: 'helvetica', size: pick(d, { large: 8.8, medium: 7.4, small: 6.6 }), color: MUTED };
  descStyle.lineHeight = descStyle.size * 1.3;
  const catStyle: TextStyle = { font: 'helvetica-bold', size: pick(d, { large: 7, medium: 6.2, small: 5.6 }), color: c.primaryText, charSpace: 0.8 };
  const detailStyle: TextStyle = { font: 'helvetica', size: pick(d, { large: 7, medium: 6.2, small: 5.6 }), color: MUTED };
  const priceSize = pick(d, { large: 14, medium: 11, small: 9 });
  const oldStyle: TextStyle = { font: 'helvetica', size: priceSize * 0.72, color: MUTED };
  const pad = pick(d, { large: 10, medium: 7, small: 5 });

  const headerH = portrait ? 70 : 58;
  const footerH = 30;
  const content: Box = { x: M, y: headerH + 20, w: W - 2 * M, h: H - headerH - 20 - footerH - 22 };

  const drawCard = (ops: DrawOp[], product: Product, box: Box) => {
    ops.push({ kind: 'rect', ...box, fill: CARD_BG, stroke: CARD_LINE, lineWidth: 0.8, r: 8 });
    const imgS = box.h - 2 * pad;
    productImage(ops, input, product.imageId, { x: box.x + pad, y: box.y + pad, w: imgS, h: imgS }, { bg: '#F4ECE0', placeholderFg: '#C9B9A3', r: 6 });
    const prices = priceTexts(product, input);
    if (prices.discount) {
      const fs = pick(d, { large: 7.5, medium: 6.5, small: 5.8 });
      const bw = measureText(prices.discount, 'helvetica-bold', fs) + fs * 1.2;
      ops.push({ kind: 'rect', x: box.x + pad + 4, y: box.y + pad + 4, w: bw, h: fs * 1.9, fill: c.primary, r: 3 });
      ops.push({ kind: 'text', x: box.x + pad + 4 + fs * 0.6, y: box.y + pad + 4 + fs * 1.33, text: prices.discount, font: 'helvetica-bold', size: fs, color: c.onPrimary });
    }
    const tx = box.x + pad + imgS + pad + 2;
    const tw = box.x + box.w - pad - tx;

    // Étiquette de prix (jaune) en haut à droite.
    const ph = priceSize * 1.9;
    const pw = Math.min(measureText(prices.price, 'helvetica-bold', priceSize) + priceSize * 1.2, tw * 0.6);
    const priceX = box.x + box.w - pad - pw;
    ops.push({ kind: 'rect', x: priceX, y: box.y + pad, w: pw, h: ph, fill: STICKER, r: 4 });
    line(ops, prices.price, priceX, box.y + pad + ph / 2 + priceSize * 0.36, pw, { font: 'helvetica-bold', size: priceSize, color: INK }, 'center');
    let underPrice = box.y + pad + ph;
    if (prices.oldPrice) {
      const ow = measureText(prices.oldPrice, oldStyle.font, oldStyle.size);
      struckText(ops, prices.oldPrice, box.x + box.w - pad - ow, underPrice + oldStyle.size * 1.3, oldStyle);
      underPrice += oldStyle.size * 1.6;
    }

    // Texte à gauche de l'étiquette sur la hauteur de celle-ci, puis toute la largeur.
    const topW = priceX - tx - 8;
    let y = box.y + pad - 1;
    if (product.category && !compact && !settings.groupByCategory) {
      line(ops, product.category.toLocaleUpperCase('fr-FR'), tx, y + catStyle.size * 0.85, topW, catStyle);
      y += catStyle.size * 1.5;
    }
    const nameLines = compact ? 1 : 2;
    y = paragraph(ops, product.name, tx, y, topW, nameStyle, nameLines);
    const bottomReserve = settings.showDetails && (product.availability || product.reference) ? detailStyle.size * 2.4 : 0;
    const availableH = box.y + box.h - pad - bottomReserve - (y + 2);
    const descW = y + 2 < underPrice ? topW : tw;
    const maxDesc = Math.floor(availableH / descStyle.lineHeight!);
    if (settings.showDescription && product.description.trim() && maxDesc > 0) {
      paragraph(ops, product.description, tx, y + 2, descW, descStyle, Math.min(maxDesc, pick(d, { large: 4, medium: 3, small: 2 })));
    }
    if (bottomReserve) {
      const by = box.y + box.h - pad - detailStyle.size * 1.8;
      let bx = tx;
      if (product.availability && !compact) bx += availabilityBadge(ops, product.availability, tx, by, detailStyle.size) + 6;
      const ref = compact ? detailsText(product) : product.reference.trim() ? `Réf. ${product.reference.trim()}` : '';
      if (ref) line(ops, ref, bx, by + detailStyle.size * 1.25, box.x + box.w - pad - bx, detailStyle);
    }
    const link = productLink(input, product);
    if (link) ops.push({ kind: 'link', ...box, url: link });
  };

  const drawSectionHeader = (ops: DrawOp[], title: string, box: Box) => {
    const t = pdfText(title).toLocaleUpperCase('fr-FR');
    const fs = 10.5;
    const w = Math.min(measureText(t, 'helvetica-bold', fs, 1) + 24, box.w);
    ops.push({ kind: 'rect', x: box.x, y: box.y + 2, w, h: 22, fill: c.primary, r: 4 });
    line(ops, t, box.x + 12, box.y + 17, w - 24, { font: 'helvetica-bold', size: fs, color: c.onPrimary, charSpace: 1 });
    ops.push({ kind: 'line', x1: box.x + w + 6, y1: box.y + 13, x2: box.x + box.w, y2: box.y + 13, color: c.primary, width: 1.2, dash: [4, 3] });
  };

  const drawHeader = (ops: DrawOp[]) => {
    ops.push({ kind: 'rect', x: 0, y: 0, w: W, h: headerH, fill: c.primary });
    ops.push({ kind: 'rect', x: 0, y: headerH, w: W, h: 5, fill: STICKER });
    const label = settings.coverTitle.toLocaleUpperCase('fr-FR');
    const lw = measureText(label, 'helvetica-bold', 9, 1.5);
    line(ops, shop.name, M, headerH / 2 + 7, W - 2 * M - lw - 30, { font: 'helvetica-bold', size: 19, color: c.onPrimary });
    line(ops, label, M, headerH / 2 + 4, W - 2 * M, { font: 'helvetica-bold', size: 9, color: c.onPrimary, charSpace: 1.5 }, 'right');
  };

  const drawFooter = (ops: DrawOp[], pageNumber: number, total: number) => {
    const y = H - footerH - 12;
    ops.push({ kind: 'rect', x: M, y, w: W - 2 * M, h: footerH, fill: c.dark, r: footerH / 2 });
    const label = `${pageNumber} / ${total}`;
    const lw = measureText(label, 'helvetica-bold', 8.5);
    line(ops, label, M, y + footerH / 2 + 3, W - 2 * M - 16, { font: 'helvetica-bold', size: 8.5, color: '#FFFFFF' }, 'right');
    contactLine(ops, contacts, M + 16, y + footerH / 2 + 2.8, W - 2 * M - lw - 48, { font: 'helvetica', size: 7.8, color: '#FFFFFF' });
  };

  return paginate(
    input,
    {
      pageBackground: '#FFFFFF',
      content,
      gapX: pick(d, { large: 14, medium: 12, small: 10 }),
      gapY: pick(d, { large: 12, medium: 10, small: 8 }),
      sectionHeaderHeight: 32,
      drawBackground: () => {},
      drawHeader,
      drawFooter,
      drawSectionHeader,
      drawCard,
    },
    g,
    buildCover(input, W, H, c, contacts),
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
  const portrait = settings.orientation === 'portrait';
  const onP = c.onPrimary;
  const ops: DrawOp[] = [{ kind: 'rect', x: 0, y: 0, w: W, h: H, fill: c.primary }];
  // Motif de pastilles décoratives.
  for (let i = 0; i < 7; i++) {
    ops.push({ kind: 'ellipse', cx: W - 40 - i * 14, cy: 40 + (i % 2) * 14, rx: 3, ry: 3, fill: onP, opacity: 0.25 });
  }
  ops.push({ kind: 'ellipse', cx: -40, cy: H * 0.55, rx: 160, ry: 160, fill: mix(c.primary, '#FFFFFF', 0.12), opacity: 0.6 });

  const M = 44;
  const textW = portrait ? W - 2 * M - 120 : W * 0.44;
  let y = portrait ? 70 : 56;
  if (shop.logoId && input.availableImages.has(shop.logoId)) {
    ops.push({ kind: 'rect', x: M, y, w: 64, h: 64, fill: '#FFFFFF', r: 14 });
    ops.push({ kind: 'image', x: M + 6, y: y + 6, w: 52, h: 52, imageId: shop.logoId, fit: 'contain', bg: '#FFFFFF', r: 10 });
    y += 64 + 24;
  }
  y = bigTitle(ops, shop.name, M, y, textW, { font: 'helvetica-bold', size: portrait ? 44 : 38, minSize: 22, color: onP, lineHeight: 1.04 });
  y += 12;
  ops.push({ kind: 'rect', x: M, y, w: 60, h: 6, fill: STICKER, r: 3 });
  y += 20;
  if (shop.slogan.trim()) y = paragraph(ops, shop.slogan, M, y, textW, { font: 'helvetica', size: 14, color: onP, lineHeight: 18 }, 3);

  // Étiquette ronde « MENU » / « CATALOGUE ».
  const sr = portrait ? 56 : 50;
  const scx = portrait ? W - M - sr + 6 : W * 0.5;
  const scy = portrait ? 120 : 110;
  ops.push({ kind: 'ellipse', cx: scx, cy: scy, rx: sr, ry: sr, fill: STICKER });
  ops.push({ kind: 'ellipse', cx: scx, cy: scy, rx: sr - 5, ry: sr - 5, stroke: INK, lineWidth: 0.8 });
  const stickerTitle = settings.coverTitle.toLocaleUpperCase('fr-FR');
  const fs = Math.min(15, (2 * sr - 22) / Math.max(1, measureText(stickerTitle, 'helvetica-bold', 1)));
  line(ops, stickerTitle, scx - sr + 8, scy + 2, 2 * sr - 16, { font: 'helvetica-bold', size: Math.max(7, fs), color: INK }, 'center');
  line(ops, monthYearFr(input.date), scx - sr + 8, scy + 16, 2 * sr - 16, { font: 'helvetica', size: 7.5, color: INK }, 'center');

  // Carte contacts en bas (position calculée d'abord pour placer les photos au-dessus).
  const showCard = settings.showContact && contacts.length > 0;
  const cardH = portrait ? 132 : 112;
  const cardY = H - cardH - (portrait ? 40 : 36);

  // Photos carrées en cadres blancs : on choisit la disposition qui donne les plus grandes photos.
  const ids = coverImages(input, 4);
  const areaTop = portrait ? y + 30 : 56;
  const areaBottom = portrait ? (showCard ? cardY - 26 : H - 60) : H - 56;
  const area: Box = portrait
    ? { x: M, y: areaTop, w: W - 2 * M, h: areaBottom - areaTop }
    : { x: W * 0.56, y: areaTop, w: W * 0.44 - M, h: areaBottom - areaTop };
  if (ids.length > 0 && area.h > 60) {
    const n = ids.length;
    const gap = 14;
    let best = { cols: 1, rows: n, s: 0 };
    for (let cols = 1; cols <= n; cols++) {
      const rows = Math.ceil(n / cols);
      const s = Math.min((area.w - gap * (cols - 1)) / cols, (area.h - gap * (rows - 1)) / rows);
      if (s > best.s) best = { cols, rows, s };
    }
    const s = Math.min(best.s, 230) - 10;
    const gridW = best.cols * (s + 10) + (best.cols - 1) * gap;
    const gridH = best.rows * (s + 10) + (best.rows - 1) * gap;
    const startX = area.x + (area.w - gridW) / 2 + 5;
    const startY = area.y + (area.h - gridH) / 2 + 5;
    ids.forEach((id, i) => {
      const col = i % best.cols;
      const row = Math.floor(i / best.cols);
      const x = startX + col * (s + 10 + gap);
      const yy = startY + row * (s + 10 + gap);
      ops.push({ kind: 'rect', x: x - 5, y: yy - 5, w: s + 10, h: s + 10, fill: '#FFFFFF', r: 14 });
      ops.push({ kind: 'image', x, y: yy, w: s, h: s, imageId: id, fit: 'cover', bg: '#F4ECE0', r: 10 });
    });
  }

  if (showCard) {
    const cardW = portrait ? W - 2 * M : W * 0.46;
    ops.push({ kind: 'rect', x: M, y: cardY, w: cardW, h: cardH, fill: '#FFFFFF', r: 16 });
    const cols = portrait ? 3 : 2;
    const colW = (cardW - 36 - (cols - 1) * 10) / cols;
    for (let i = 0; i < cols; i++) {
      const items = contacts.slice(i * 2, i * 2 + 2);
      if (!items.length) break;
      contactList(ops, items, M + 18 + i * (colW + 10), cardY + 16, colW, { font: 'helvetica-bold', size: 6.5, color: c.primaryText, charSpace: 0.8 }, { font: 'helvetica', size: 9.5, color: INK }, 6);
    }
    whatsappButton(ops, input, M + 18, cardY + cardH - 36, { bg: STICKER, fg: INK }, 9.5);
  }
  return { ops };
}

export const foodTemplate: TemplateDefinition = { ...TEMPLATE_META.food, layout };
