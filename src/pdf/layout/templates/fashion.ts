// Modèle 2 — Mode élégante : fond crème, typographie à empattements, photos hautes, texte centré.

import { mix } from '../../../core/color';
import { monthYearFr } from '../../../core/text';
import type { Product } from '../../../core/types';
import { TEMPLATE_META } from '../meta';
import { measureText, pdfText } from '../../measure';
import {
  bigTitle,
  contactItems,
  contactLine,
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

const CREAM = '#FAF6F0';
const INK = '#1C1814';
const MUTED = '#6E655C';
const PHOTO_BG = '#EFE8DE';

const grid = TEMPLATE_META.fashion.grid;

const upper = (t: string) => t.toLocaleUpperCase('fr-FR');

function layout(input: LayoutInput): LayoutResult {
  const { settings, shop } = input;
  const size = pageSize(settings.orientation);
  const W = size.w;
  const H = size.h;
  const c = palette(shop.primaryColor, CREAM);
  const d = settings.density;
  const portrait = settings.orientation === 'portrait';
  const M = 42;
  const contacts = settings.showContact ? contactItems(input) : [];

  const catStyle: TextStyle = { font: 'helvetica', size: pick(d, { large: 6.8, medium: 6.2, small: 5.6 }), color: c.primaryText, charSpace: 1.4 };
  const nameStyle: TextStyle = { font: 'times', size: pick(d, { large: 11.5, medium: 10, small: 8.5 }), color: INK, charSpace: 0.9 };
  nameStyle.lineHeight = nameStyle.size * 1.25;
  const descStyle: TextStyle = { font: 'times-italic', size: pick(d, { large: 9, medium: 8.2, small: 7.2 }), color: MUTED };
  descStyle.lineHeight = descStyle.size * 1.28;
  const priceStyle: TextStyle = { font: 'times-bold', size: pick(d, { large: 13, medium: 11.5, small: 9.5 }), color: INK };
  const oldStyle: TextStyle = { font: 'times', size: priceStyle.size * 0.78, color: MUTED };
  const detailStyle: TextStyle = { font: 'helvetica', size: pick(d, { large: 6.6, medium: 6, small: 5.4 }), color: MUTED, charSpace: 0.3 };
  const nameLines = 2;
  const descLines = settings.showDescription ? pick(d, { large: 2, medium: 2, small: 1 }) : 0;
  const pad = pick(d, { large: 11, medium: 9, small: 7 });
  const textH =
    pad +
    catStyle.size * 1.6 +
    nameLines * nameStyle.lineHeight! +
    (descLines ? 2 + descLines * descStyle.lineHeight! : 0) +
    (settings.showDetails ? detailStyle.size * 1.5 : 0) +
    4 +
    priceStyle.size * 1.15;

  const content: Box = portrait
    ? { x: M, y: 84, w: W - 2 * M, h: H - 84 - 76 }
    : { x: M, y: 74, w: W - 2 * M, h: H - 74 - 62 };

  const drawCard = (ops: DrawOp[], product: Product, box: Box) => {
    const imgH = box.h - textH;
    productImage(ops, input, product.imageId, { x: box.x, y: box.y, w: box.w, h: imgH }, { bg: PHOTO_BG, placeholderFg: '#B9AE9F' });
    const prices = priceTexts(product, input);
    if (prices.discount) {
      const fs = pick(d, { large: 8, medium: 7.2, small: 6.4 });
      const bw = measureText(prices.discount, 'helvetica-bold', fs, 0.5) + fs * 1.6;
      ops.push({ kind: 'rect', x: box.x + box.w - bw, y: box.y, w: bw, h: fs * 2.2, fill: INK });
      ops.push({ kind: 'text', x: box.x + box.w - bw + fs * 0.8, y: box.y + fs * 1.45, text: prices.discount, font: 'helvetica-bold', size: fs, color: '#FFFFFF', charSpace: 0.5 });
    }
    if (product.availability === 'sold_out') {
      const fs = pick(d, { large: 8, medium: 7.2, small: 6.4 });
      ops.push({ kind: 'rect', x: box.x, y: box.y + imgH - fs * 2.4, w: box.w, h: fs * 2.4, fill: '#FFFFFF', opacity: 0.85 });
      line(ops, 'ÉPUISÉ', box.x, box.y + imgH - fs * 0.85, box.w, { font: 'helvetica-bold', size: fs, color: INK, charSpace: 2 }, 'center');
    }
    let y = box.y + imgH + pad;
    if (product.category && !settings.groupByCategory) {
      line(ops, upper(product.category), box.x, y + catStyle.size * 0.8, box.w, catStyle, 'center');
    }
    y += catStyle.size * 1.6;
    y = paragraph(ops, upper(product.name), box.x, y, box.w, nameStyle, nameLines, 'center');
    if (descLines && product.description.trim()) {
      y = paragraph(ops, product.description, box.x + 4, y + 2, box.w - 8, descStyle, descLines, 'center');
    }
    if (settings.showDetails) {
      const details = detailsText({ ...product, availability: product.availability === 'sold_out' ? '' : product.availability });
      if (details) line(ops, details, box.x, y + detailStyle.size * 1.2, box.w, detailStyle, 'center');
    }
    // Prix centré en bas de fiche, ancien prix barré à côté.
    const baseline = box.y + box.h - priceStyle.size * 0.25;
    const pw = measureText(prices.price, priceStyle.font, priceStyle.size);
    const ow = prices.oldPrice ? measureText(prices.oldPrice, oldStyle.font, oldStyle.size) : 0;
    const gap = prices.oldPrice ? 8 : 0;
    const total = pw + gap + ow;
    if (total <= box.w) {
      const sx = box.x + (box.w - total) / 2;
      if (prices.oldPrice) struckText(ops, prices.oldPrice, sx, baseline, oldStyle);
      ops.push({ kind: 'text', x: sx + ow + gap, y: baseline, text: prices.price, font: priceStyle.font, size: priceStyle.size, color: INK });
    } else {
      line(ops, prices.price, box.x, baseline, box.w, priceStyle, 'center');
    }
    const link = productLink(input, product);
    if (link) ops.push({ kind: 'link', ...box, url: link });
  };

  const drawSectionHeader = (ops: DrawOp[], title: string, box: Box) => {
    const style: TextStyle = { font: 'times', size: 13, color: INK, charSpace: 3 };
    const t = upper(pdfText(title));
    const w = Math.min(measureText(t, style.font, style.size, style.charSpace), box.w - 80);
    line(ops, t, box.x, box.y + 18, box.w, style, 'center');
    const cy = box.y + 14;
    ops.push({ kind: 'line', x1: box.x, y1: cy, x2: box.x + (box.w - w) / 2 - 14, y2: cy, color: c.primary, width: 0.6 });
    ops.push({ kind: 'line', x1: box.x + (box.w + w) / 2 + 14, y1: cy, x2: box.x + box.w, y2: cy, color: c.primary, width: 0.6 });
  };

  const drawBackground = (ops: DrawOp[]) => {
    ops.push({ kind: 'rect', x: 0, y: 0, w: W, h: H, fill: CREAM });
  };

  const drawHeader = (ops: DrawOp[]) => {
    const top = portrait ? 44 : 38;
    line(ops, upper(shop.name), M, top, W - 2 * M, { font: 'times', size: 11, color: INK, charSpace: 3.2 }, 'center');
    ops.push({ kind: 'line', x1: M, y1: top + 13, x2: W - M, y2: top + 13, color: mix(INK, CREAM, 0.75), width: 0.6 });
  };

  const drawFooter = (ops: DrawOp[], pageNumber: number, total: number) => {
    const y = H - (portrait ? 56 : 46);
    ops.push({ kind: 'line', x1: M, y1: y, x2: W - M, y2: y, color: mix(INK, CREAM, 0.75), width: 0.6 });
    contactLine(ops, contacts, M + 60, y + 16, W - 2 * M - 120, { font: 'helvetica', size: 7.2, color: MUTED, charSpace: 0.3 }, 'center');
    line(ops, `${pageNumber} / ${total}`, M, y + 16, W - 2 * M, { font: 'times-italic', size: 9, color: INK }, 'right');
    line(ops, upper(settings.coverTitle), M, y + 16, 110, { font: 'helvetica', size: 6.5, color: MUTED, charSpace: 1.2 }, 'left');
  };

  return paginate(
    input,
    {
      pageBackground: CREAM,
      content,
      gapX: pick(d, { large: 22, medium: 18, small: 12 }),
      gapY: pick(d, { large: 22, medium: 20, small: 14 }),
      sectionHeaderHeight: 34,
      drawBackground,
      drawHeader,
      drawFooter,
      drawSectionHeader,
      drawCard,
    },
    grid(settings.orientation, d),
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
  const ops: DrawOp[] = [{ kind: 'rect', x: 0, y: 0, w: W, h: H, fill: CREAM }];
  const portrait = settings.orientation === 'portrait';
  const ids = coverImages(input, 3);
  const hero: Box = portrait ? { x: 0, y: 0, w: W, h: H * 0.56 } : { x: W * 0.5, y: 0, w: W * 0.5, h: H };

  if (ids.length >= 3 && portrait) {
    const main = { x: 0, y: 0, w: W * 0.64, h: hero.h };
    ops.push({ kind: 'image', ...main, imageId: ids[0], fit: 'cover', bg: PHOTO_BG });
    const sw = W - main.w - 6;
    const sh = (hero.h - 6) / 2;
    ops.push({ kind: 'image', x: main.w + 6, y: 0, w: sw, h: sh, imageId: ids[1], fit: 'cover', bg: PHOTO_BG });
    ops.push({ kind: 'image', x: main.w + 6, y: sh + 6, w: sw, h: sh, imageId: ids[2], fit: 'cover', bg: PHOTO_BG });
  } else if (ids.length > 0) {
    ops.push({ kind: 'image', ...hero, imageId: ids[0], fit: 'cover', bg: PHOTO_BG });
  } else {
    ops.push({ kind: 'rect', ...hero, fill: mix(c.primary, INK, 0.55) });
    const initial = upper(shop.name.trim().charAt(0) || 'C');
    line(ops, initial, hero.x, hero.y + hero.h / 2 + 50, hero.w, { font: 'times', size: 150, color: mix(c.primary, '#FFFFFF', 0.6) }, 'center');
  }

  const text: Box = portrait ? { x: 56, y: hero.h, w: W - 112, h: H - hero.h } : { x: 48, y: 0, w: W * 0.5 - 96, h: H };
  let y = text.y + (portrait ? 44 : 70);

  if (shop.logoId && input.availableImages.has(shop.logoId)) {
    const s = 66;
    const cx = text.x + text.w / 2;
    const cy = portrait ? hero.h : y + s / 2;
    ops.push({ kind: 'ellipse', cx, cy, rx: s / 2 + 5, ry: s / 2 + 5, fill: CREAM });
    ops.push({ kind: 'image', x: cx - s / 2, y: cy - s / 2, w: s, h: s, imageId: shop.logoId, fit: 'contain', bg: '#FFFFFF', shape: 'circle' });
    y = portrait ? hero.h + s / 2 + 26 : y + s + 28;
  }

  line(ops, upper(`${settings.coverTitle} · ${monthYearFr(input.date)}`), text.x, y + 8, text.w, { font: 'helvetica', size: 8.5, color: c.primaryText, charSpace: 2.6 }, 'center');
  y += 26;
  y = bigTitle(ops, upper(shop.name), text.x, y, text.w, { font: 'times', size: portrait ? 38 : 34, minSize: 20, color: INK, charSpace: 3, lineHeight: 1.12 }, 'center');
  y += 14;
  ops.push({ kind: 'line', x1: text.x + text.w / 2 - 24, y1: y, x2: text.x + text.w / 2 + 24, y2: y, color: c.primary, width: 1.2 });
  y += 16;
  if (shop.slogan.trim()) {
    y = paragraph(ops, shop.slogan, text.x, y, text.w, { font: 'times-italic', size: 14, color: MUTED, lineHeight: 18 }, 3, 'center');
  }

  const bottom = portrait ? H - 48 : H - 56;
  if (settings.showContact && contacts.length > 0) {
    const bh = whatsappButton(ops, input, text.x, bottom - 58, { bg: INK, fg: '#FFFFFF' }, 9, 'center', text.w);
    const cy = bh > 0 ? bottom - 12 : bottom - 20;
    const first = contacts.slice(0, 3);
    const second = contacts.slice(3);
    contactLine(ops, first, text.x - 20, cy - (second.length ? 12 : 0), text.w + 40, { font: 'helvetica', size: 8, color: INK, charSpace: 0.3 }, 'center');
    if (second.length) contactLine(ops, second, text.x - 20, cy + 2, text.w + 40, { font: 'helvetica', size: 8, color: MUTED, charSpace: 0.3 }, 'center');
  } else {
    const n = input.products.length;
    line(ops, `${n} pièce${n > 1 ? 's' : ''}`, text.x, bottom - 10, text.w, { font: 'times-italic', size: 11, color: MUTED }, 'center');
  }
  return { ops };
}

export const fashionTemplate: TemplateDefinition = { ...TEMPLATE_META.fashion, layout };
