// Briques communes aux modèles : texte aligné, images, contacts, pagination, filigrane.

import { discountPercent, formatPrice } from '../../core/price';
import { AVAILABILITY_LABELS } from '../../core/defaults';
import { mix, readableOn, textOn } from '../../core/color';
import { socialLabel, socialUrl, whatsappLink } from '../../core/text';
import type { Availability, Orientation, Product } from '../../core/types';
import { ellipsize, fitLine, measureText, pdfText, wrapText, type FontKey } from '../measure';
import type { Box, DrawOp, GridSpec, LayoutInput, LayoutPage, LayoutResult } from './types';

export const A4 = { w: 595.28, h: 841.89 };

export function pageSize(orientation: Orientation) {
  return orientation === 'portrait' ? { w: A4.w, h: A4.h } : { w: A4.h, h: A4.w };
}

export type Align = 'left' | 'center' | 'right';

export interface TextStyle {
  font: FontKey;
  size: number;
  color: string;
  charSpace?: number;
  lineHeight?: number;
}

/** Ajoute une ligne de texte alignée dans une zone [x, x + width]. */
export function line(
  ops: DrawOp[],
  text: string,
  x: number,
  baseline: number,
  width: number,
  style: TextStyle,
  align: Align = 'left',
  opacity?: number,
): number {
  const clean = ellipsize(text, style.font, style.size, width, style.charSpace ?? 0);
  if (!clean) return 0;
  const w = measureText(clean, style.font, style.size, style.charSpace ?? 0);
  const startX = align === 'left' ? x : align === 'center' ? x + (width - w) / 2 : x + width - w;
  ops.push({
    kind: 'text',
    x: startX,
    y: baseline,
    text: clean,
    font: style.font,
    size: style.size,
    color: style.color,
    charSpace: style.charSpace,
    opacity,
  });
  return w;
}

/**
 * Ajoute un paragraphe (plusieurs lignes). Retourne la position y sous le paragraphe.
 * `top` est le haut de la première ligne.
 */
export function paragraph(
  ops: DrawOp[],
  text: string,
  x: number,
  top: number,
  width: number,
  style: TextStyle,
  maxLines: number,
  align: Align = 'left',
): number {
  if (!text.trim() || maxLines <= 0) return top;
  const lh = style.lineHeight ?? style.size * 1.25;
  const { lines } = wrapText(text, style.font, style.size, width, {
    maxLines,
    charSpace: style.charSpace,
  });
  let baseline = top + style.size * 0.8;
  for (const l of lines) {
    line(ops, l, x, baseline, width, style, align);
    baseline += lh;
  }
  return top + lines.length * lh;
}

/** Nombre de lignes qu'occupera un texte (sans dessiner). */
export function countLines(
  text: string,
  style: TextStyle,
  width: number,
  maxLines: number,
): number {
  if (!text.trim()) return 0;
  return wrapText(text, style.font, style.size, width, { maxLines, charSpace: style.charSpace })
    .lines.length;
}

/** Palette dérivée de la couleur principale, lisible quelle que soit la couleur choisie. */
export function palette(primary: string, pageBg = '#FFFFFF') {
  return {
    primary,
    /** Couleur principale utilisable comme texte sur le fond de page. */
    primaryText: readableOn(primary, pageBg, 4.5),
    /** Couleur du texte posé sur un aplat de couleur principale. */
    onPrimary: textOn(primary),
    tint: mix(primary, '#FFFFFF', 0.9),
    tintStrong: mix(primary, '#FFFFFF', 0.75),
    dark: mix(primary, '#000000', 0.55),
    ink: '#16181D',
    muted: '#5B6170',
    faint: '#8A90A0',
    line: '#E3E5EA',
    white: '#FFFFFF',
  };
}

export type Palette = ReturnType<typeof palette>;

/** Emplacement de photo vide : pictogramme discret + « Photo à venir ». */
export function placeholder(
  ops: DrawOp[],
  box: Box,
  bg: string,
  fg: string,
  r = 0,
  circle = false,
) {
  if (circle) {
    ops.push({
      kind: 'ellipse',
      cx: box.x + box.w / 2,
      cy: box.y + box.h / 2,
      rx: box.w / 2,
      ry: box.h / 2,
      fill: bg,
    });
  } else {
    ops.push({ kind: 'rect', x: box.x, y: box.y, w: box.w, h: box.h, fill: bg, r });
  }
  const s = Math.min(box.w, box.h) * 0.28;
  if (s < 8) return;
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2 - (box.h > 70 ? 6 : 0);
  const iw = s;
  const ih = s * 0.75;
  ops.push({
    kind: 'rect',
    x: cx - iw / 2,
    y: cy - ih / 2,
    w: iw,
    h: ih,
    stroke: fg,
    lineWidth: 1.2,
    r: 2,
  });
  ops.push({
    kind: 'ellipse',
    cx: cx + iw * 0.2,
    cy: cy - ih * 0.18,
    rx: iw * 0.08,
    ry: iw * 0.08,
    fill: fg,
  });
  ops.push({
    kind: 'line',
    x1: cx - iw / 2 + 2,
    y1: cy + ih / 2 - 3,
    x2: cx - iw * 0.1,
    y2: cy,
    color: fg,
    width: 1.2,
  });
  ops.push({
    kind: 'line',
    x1: cx - iw * 0.1,
    y1: cy,
    x2: cx + iw / 2 - 2,
    y2: cy + ih / 2 - 3,
    color: fg,
    width: 1.2,
  });
  if (box.h > 70 && box.w > 60) {
    line(
      ops,
      'Photo à venir',
      box.x,
      cy + ih / 2 + 12,
      box.w,
      { font: 'helvetica', size: 7.5, color: fg },
      'center',
    );
  }
}

/** Photo du produit, ou emplacement vide si pas de photo. */
export function productImage(
  ops: DrawOp[],
  input: LayoutInput,
  imageId: string | null,
  box: Box,
  opts: { bg: string; placeholderFg: string; r?: number; circle?: boolean },
) {
  if (imageId && input.availableImages.has(imageId)) {
    ops.push({
      kind: 'image',
      ...box,
      imageId,
      fit: input.settings.imageFit,
      bg: opts.bg,
      r: opts.r,
      shape: opts.circle ? 'circle' : 'rect',
    });
  } else {
    placeholder(ops, box, opts.bg, opts.placeholderFg, opts.r ?? 0, opts.circle);
  }
}

export interface PriceTexts {
  price: string;
  oldPrice: string | null;
  discount: string | null;
}

export function priceTexts(product: Product, input: LayoutInput): PriceTexts {
  const currency = input.shop.currency;
  const price = product.price != null ? pdfText(formatPrice(product.price, currency)) : '';
  const showOld =
    input.settings.showOldPrice &&
    product.oldPrice != null &&
    product.price != null &&
    product.oldPrice > product.price;
  const pct = showOld ? discountPercent(product.price, product.oldPrice) : null;
  return {
    price,
    oldPrice:
      showOld && product.oldPrice != null ? pdfText(formatPrice(product.oldPrice, currency)) : null,
    discount: pct != null ? `-${pct}\u00A0%` : null,
  };
}

/** Prix barré : texte + trait horizontal. Retourne la largeur. */
export function struckText(
  ops: DrawOp[],
  text: string,
  x: number,
  baseline: number,
  style: TextStyle,
): number {
  const w = measureText(text, style.font, style.size);
  ops.push({
    kind: 'text',
    x,
    y: baseline,
    text,
    font: style.font,
    size: style.size,
    color: style.color,
  });
  ops.push({
    kind: 'line',
    x1: x - 0.5,
    y1: baseline - style.size * 0.3,
    x2: x + w + 0.5,
    y2: baseline - style.size * 0.3,
    color: style.color,
    width: Math.max(0.5, style.size * 0.07),
  });
  return w;
}

export const AVAILABILITY_COLORS: Record<Exclude<Availability, ''>, string> = {
  in_stock: '#157347',
  limited: '#B45309',
  on_order: '#1D4ED8',
  sold_out: '#6B7280',
};

/** Pastille de disponibilité (« En stock », « Épuisé »…). Retourne la largeur. */
export function availabilityBadge(
  ops: DrawOp[],
  availability: Availability,
  x: number,
  y: number,
  size = 6.5,
  align: Align = 'left',
): number {
  if (!availability) return 0;
  const label = AVAILABILITY_LABELS[availability];
  const color = AVAILABILITY_COLORS[availability];
  const padX = size * 0.7;
  const h = size * 1.8;
  const w = measureText(label, 'helvetica-bold', size) + padX * 2;
  const bx = align === 'left' ? x : align === 'center' ? x - w / 2 : x - w;
  ops.push({ kind: 'rect', x: bx, y, w, h, fill: mix(color, '#FFFFFF', 0.88), r: h / 2 });
  ops.push({
    kind: 'text',
    x: bx + padX,
    y: y + h / 2 + size * 0.35,
    text: label,
    font: 'helvetica-bold',
    size,
    color,
  });
  return w;
}

/** Ligne « Réf. X · En stock » en texte simple (pour les petites fiches). */
export function detailsText(product: Product): string {
  const parts: string[] = [];
  if (product.reference.trim()) parts.push(`Réf. ${product.reference.trim()}`);
  if (product.availability) parts.push(AVAILABILITY_LABELS[product.availability]);
  return parts.join(' · ');
}

export interface ContactItem {
  key: 'whatsapp' | 'phone' | 'email' | 'address' | 'instagram' | 'facebook';
  label: string;
  value: string;
  url: string | null;
}

export function contactItems(input: LayoutInput): ContactItem[] {
  const s = input.shop;
  const items: ContactItem[] = [];
  const wa = input.settings.whatsappLinks ? whatsappLink(s.whatsapp) : null;
  if (s.whatsapp.trim())
    items.push({ key: 'whatsapp', label: 'WhatsApp', value: s.whatsapp.trim(), url: wa });
  if (s.phone.trim() && s.phone.trim() !== s.whatsapp.trim())
    items.push({ key: 'phone', label: 'Tél.', value: s.phone.trim(), url: null });
  if (s.email.trim())
    items.push({
      key: 'email',
      label: 'E-mail',
      value: s.email.trim(),
      url: `mailto:${s.email.trim()}`,
    });
  if (s.address.trim())
    items.push({ key: 'address', label: 'Adresse', value: s.address.trim(), url: null });
  if (s.instagram.trim())
    items.push({
      key: 'instagram',
      label: 'Instagram',
      value: socialLabel(s.instagram),
      url: socialUrl('instagram', s.instagram),
    });
  if (s.facebook.trim())
    items.push({
      key: 'facebook',
      label: 'Facebook',
      value: socialLabel(s.facebook),
      url: socialUrl('facebook', s.facebook),
    });
  return items;
}

/**
 * Ligne de contacts pour le pied de page : réduit la police puis retire les éléments les moins
 * importants si la ligne est trop longue. Ne coupe jamais un texte au milieu.
 */
export function contactLine(
  ops: DrawOp[],
  items: ContactItem[],
  x: number,
  baseline: number,
  width: number,
  style: TextStyle,
  align: Align = 'left',
  separator = '   ·   ',
) {
  const order = ['whatsapp', 'phone', 'email', 'address', 'instagram', 'facebook'];
  let current = [...items].sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
  const minSize = Math.max(6, style.size - 1.5);
  const format = (it: ContactItem) =>
    it.key === 'whatsapp' || it.key === 'phone' ? `${it.label} ${it.value}` : it.value;
  let size = style.size;
  const total = (list: ContactItem[], s: number) =>
    measureText(list.map(format).join(separator), style.font, s, style.charSpace);
  while (current.length > 0) {
    size = style.size;
    while (size > minSize && total(current, size) > width) size -= 0.5;
    if (total(current, size) <= width) break;
    current = current.slice(0, -1);
  }
  if (current.length === 0) return;
  const full = total(current, size);
  let cx = align === 'left' ? x : align === 'center' ? x + (width - full) / 2 : x + width - full;
  current.forEach((it, i) => {
    const text = format(it);
    const w = measureText(text, style.font, size, style.charSpace);
    ops.push({
      kind: 'text',
      x: cx,
      y: baseline,
      text,
      font: style.font,
      size,
      color: style.color,
      charSpace: style.charSpace,
    });
    if (it.url)
      ops.push({ kind: 'link', x: cx, y: baseline - size, w, h: size * 1.4, url: it.url });
    cx += w;
    if (i < current.length - 1) {
      const sw = measureText(separator, style.font, size, style.charSpace);
      ops.push({
        kind: 'text',
        x: cx,
        y: baseline,
        text: separator,
        font: style.font,
        size,
        color: style.color,
        charSpace: style.charSpace,
        opacity: 0.6,
      });
      cx += sw;
    }
  });
}

/** Lien WhatsApp avec message pré-rempli pour un produit. */
export function productLink(input: LayoutInput, product: Product): string | null {
  if (!input.settings.whatsappLinks) return null;
  const details = [
    product.price != null
      ? formatPrice(product.price, input.shop.currency).replace(/\u00A0/g, ' ')
      : '',
    product.reference.trim() ? `réf. ${product.reference.trim()}` : '',
  ].filter(Boolean);
  const suffix = details.length > 0 ? ` (${details.join(', ')})` : '';
  const message = `Bonjour, je suis intéressé(e) par : ${product.name.trim()}${suffix}. Vu dans votre catalogue.`;
  return whatsappLink(input.shop.whatsapp, message);
}

/** Choisit une valeur selon la densité (grands, moyens, petits produits). */
export function pick<T>(
  density: 'large' | 'medium' | 'small',
  values: { large: T; medium: T; small: T },
): T {
  return values[density];
}

/** Bouton « Commander sur WhatsApp » cliquable dans le PDF. Retourne la hauteur (0 si absent). */
export function whatsappButton(
  ops: DrawOp[],
  input: LayoutInput,
  x: number,
  y: number,
  colors: { bg: string; fg: string },
  size = 10,
  align: Align = 'left',
  width?: number,
): number {
  if (!input.settings.whatsappLinks) return 0;
  const url = whatsappLink(input.shop.whatsapp);
  if (!url) return 0;
  const label = 'Commander sur WhatsApp';
  const padX = size * 1.4;
  const h = size * 2.6;
  const w = measureText(label, 'helvetica-bold', size) + padX * 2;
  const bx =
    align === 'left' ? x : align === 'center' ? x + ((width ?? 0) - w) / 2 : x + (width ?? 0) - w;
  ops.push({ kind: 'rect', x: bx, y, w, h, fill: colors.bg, r: h / 2 });
  ops.push({
    kind: 'text',
    x: bx + padX,
    y: y + h / 2 + size * 0.36,
    text: label,
    font: 'helvetica-bold',
    size,
    color: colors.fg,
  });
  ops.push({ kind: 'link', x: bx, y, w, h, url });
  return h;
}

/** Filigrane discret de la version de démonstration. */
export function watermark(ops: DrawOp[], text: string, W: number, H: number) {
  const size = Math.min(W, H) * 0.062;
  const angle = 32;
  const w = measureText(text, 'helvetica-bold', size, 2);
  const rad = (angle * Math.PI) / 180;
  const cx = W / 2;
  const cy = H / 2;
  ops.push({
    kind: 'text',
    x: cx - (w / 2) * Math.cos(rad) + size * 0.35 * Math.sin(rad),
    y: cy + (w / 2) * Math.sin(rad) + size * 0.35 * Math.cos(rad),
    text,
    font: 'helvetica-bold',
    size,
    color: '#7A8194',
    charSpace: 2,
    opacity: 0.1,
    angle,
  });
}

/** Mention en bas de page pour la version de démonstration. */
export function demoMention(ops: DrawOp[], W: number, H: number, color = '#8A90A0') {
  line(
    ops,
    'Créé avec Catalogue Express — version de démonstration',
    0,
    H - 7,
    W,
    { font: 'helvetica', size: 5.5, color },
    'center',
    0.9,
  );
}

export interface FlowItemHeader {
  type: 'header';
  title: string;
}
export interface FlowItemRow {
  type: 'row';
  products: Product[];
}
export type FlowItem = FlowItemHeader | FlowItemRow;

/** Regroupe les produits en lignes de grille, avec intertitres de catégorie si demandé. */
export function buildFlow(products: Product[], cols: number, groupByCategory: boolean): FlowItem[] {
  const items: FlowItem[] = [];
  const pushRows = (list: Product[]) => {
    for (let i = 0; i < list.length; i += cols)
      items.push({ type: 'row', products: list.slice(i, i + cols) });
  };
  if (!groupByCategory) {
    pushRows(products);
    return items;
  }
  const groups = new Map<string, Product[]>();
  for (const p of products) {
    const key = p.category.trim();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }
  const keys = [...groups.keys()].filter((k) => k !== '');
  if (groups.has('')) keys.push('');
  const onlyUncategorized = keys.length === 1 && keys[0] === '';
  for (const key of keys) {
    if (!onlyUncategorized) items.push({ type: 'header', title: key || 'Autres produits' });
    pushRows(groups.get(key)!);
  }
  return items;
}

export interface ContentDesign {
  pageBackground: string;
  /** Zone des fiches produits (hors en-tête et pied de page). */
  content: Box;
  gapX: number;
  gapY: number;
  sectionHeaderHeight: number;
  drawBackground(ops: DrawOp[]): void;
  drawHeader(ops: DrawOp[], pageIndex: number): void;
  drawFooter(ops: DrawOp[], pageNumber: number, totalPages: number): void;
  drawSectionHeader(ops: DrawOp[], title: string, box: Box): void;
  drawCard(ops: DrawOp[], product: Product, box: Box): void;
}

/**
 * Pagination générique : place les lignes de fiches dans les pages, garde chaque intertitre avec
 * au moins une ligne de produits, puis dessine en-têtes et pieds de page (avec numéro / total).
 */
export function paginate(
  input: LayoutInput,
  design: ContentDesign,
  grid: GridSpec,
  cover: LayoutPage,
  size: { w: number; h: number },
): LayoutResult {
  const { content, gapX, gapY, sectionHeaderHeight } = design;
  const cardW = (content.w - gapX * (grid.cols - 1)) / grid.cols;
  const cardH = (content.h - gapY * (grid.rows - 1)) / grid.rows;
  const flow = buildFlow(input.products, grid.cols, input.settings.groupByCategory);

  const pages: DrawOp[][] = [];
  let ops: DrawOp[] | null = null;
  let y = 0;
  const newPage = () => {
    ops = [];
    pages.push(ops);
    y = content.y;
  };
  const remaining = () => content.y + content.h - y;

  for (let i = 0; i < flow.length; i++) {
    const item = flow[i];
    if (item.type === 'header') {
      const needed = sectionHeaderHeight + cardH;
      if (!ops || remaining() < needed - 0.5) newPage();
      design.drawSectionHeader(ops!, item.title, {
        x: content.x,
        y,
        w: content.w,
        h: sectionHeaderHeight,
      });
      y += sectionHeaderHeight;
    } else {
      if (!ops || remaining() < cardH - 0.5) newPage();
      item.products.forEach((product, col) => {
        design.drawCard(ops!, product, {
          x: content.x + col * (cardW + gapX),
          y,
          w: cardW,
          h: cardH,
        });
      });
      y += cardH + gapY;
    }
  }

  const total = pages.length + 1;
  const result: LayoutPage[] = [cover];
  pages.forEach((body, index) => {
    const pageOps: DrawOp[] = [];
    design.drawBackground(pageOps);
    design.drawHeader(pageOps, index);
    pageOps.push(...body);
    design.drawFooter(pageOps, index + 2, total);
    result.push({ ops: pageOps });
  });

  if (input.watermark) {
    for (const page of result) {
      watermark(page.ops, input.watermark, size.w, size.h);
      demoMention(page.ops, size.w, size.h);
    }
  }

  return { width: size.w, height: size.h, pages: result, productCount: input.products.length };
}

/** Choisit jusqu'à `max` produits avec photo pour illustrer la couverture. */
export function coverImages(input: LayoutInput, max: number): string[] {
  const ids: string[] = [];
  for (const p of input.products) {
    if (p.imageId && input.availableImages.has(p.imageId) && !ids.includes(p.imageId))
      ids.push(p.imageId);
    if (ids.length >= max) break;
  }
  return ids;
}

/** Mosaïque de 1 à 4 photos dans une zone. */
export function mosaic(ops: DrawOp[], ids: string[], box: Box, gap: number, bg: string, r = 0) {
  const n = ids.length;
  const img = (id: string, b: Box) =>
    ops.push({ kind: 'image', ...b, imageId: id, fit: 'cover', bg, r });
  if (n === 0) return;
  if (n === 1) {
    img(ids[0], box);
  } else if (n === 2) {
    const w = (box.w - gap) / 2;
    img(ids[0], { x: box.x, y: box.y, w, h: box.h });
    img(ids[1], { x: box.x + w + gap, y: box.y, w, h: box.h });
  } else if (n === 3) {
    const w = (box.w - gap) * 0.58;
    const w2 = box.w - gap - w;
    const h2 = (box.h - gap) / 2;
    img(ids[0], { x: box.x, y: box.y, w, h: box.h });
    img(ids[1], { x: box.x + w + gap, y: box.y, w: w2, h: h2 });
    img(ids[2], { x: box.x + w + gap, y: box.y + h2 + gap, w: w2, h: h2 });
  } else {
    const w = (box.w - gap) / 2;
    const h = (box.h - gap) / 2;
    img(ids[0], { x: box.x, y: box.y, w, h });
    img(ids[1], { x: box.x + w + gap, y: box.y, w, h });
    img(ids[2], { x: box.x, y: box.y + h + gap, w, h });
    img(ids[3], { x: box.x + w + gap, y: box.y + h + gap, w, h });
  }
}

/** Titre de boutique aussi grand que possible, sur 3 lignes maximum. */
export function bigTitle(
  ops: DrawOp[],
  text: string,
  x: number,
  top: number,
  width: number,
  style: TextStyle & { minSize: number },
  align: Align = 'left',
  maxLines = 3,
): number {
  let size = style.size;
  let lines: string[] = [];
  for (; size >= style.minSize; size -= 1) {
    const res = wrapText(text, style.font, size, width, { maxLines, charSpace: style.charSpace });
    lines = res.lines;
    if (!res.truncated) break;
  }
  size = Math.max(size, style.minSize);
  const lh = size * (style.lineHeight ?? 1.08);
  let baseline = top + size * 0.78;
  for (const l of lines) {
    line(ops, l, x, baseline, width, { ...style, size }, align);
    baseline += lh;
  }
  return top + lines.length * lh;
}

/** Contacts sur plusieurs lignes (couverture) : « Libellé » + valeur, avec liens. */
export function contactList(
  ops: DrawOp[],
  items: ContactItem[],
  x: number,
  top: number,
  width: number,
  labelStyle: TextStyle,
  valueStyle: TextStyle,
  gap = 6,
  align: Align = 'left',
  maxItems = 6,
): number {
  let y = top;
  for (const it of items.slice(0, maxItems)) {
    const lb = y + labelStyle.size * 0.8;
    line(ops, it.label.toUpperCase(), x, lb, width, labelStyle, align);
    const vb = lb + labelStyle.size * 0.5 + valueStyle.size * 0.95;
    const fitted = fitLine(it.value, valueStyle.font, valueStyle.size, valueStyle.size - 2, width);
    const w = line(ops, fitted.text, x, vb, width, { ...valueStyle, size: fitted.size }, align);
    if (it.url) {
      const lx = align === 'left' ? x : align === 'center' ? x + (width - w) / 2 : x + width - w;
      ops.push({ kind: 'link', x: lx, y: vb - fitted.size, w, h: fitted.size * 1.35, url: it.url });
    }
    y = vb + valueStyle.size * 0.3 + gap;
  }
  return y;
}
