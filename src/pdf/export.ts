// Génération du PDF dans le navigateur : mise en page → composition des photos → jsPDF → Blob.
// Aucune donnée n'est envoyée sur Internet.

import { getEntitlements, WATERMARK_TEXT, type Entitlements } from '../config/plans';
import { catalogFileName } from '../core/text';
import type { CatalogData } from '../core/types';
import { layoutCatalog } from './layout';
import type { ImageOp } from './layout/types';
import { imageKey, renderLayout, type PreparedImage } from './render/renderPdf';

export type ExportPhase = 'layout' | 'images' | 'pages' | 'finalize';

export interface ExportProgress {
  phase: ExportPhase;
  /** Pourcentage global (0–100). */
  percent: number;
  message: string;
}

export interface ExportResult {
  blob: Blob;
  fileName: string;
  pageCount: number;
  productCount: number;
  overLimitCount: number;
  incompleteCount: number;
  removedCharacters: boolean;
}

export interface ExportOptions {
  data: CatalogData;
  /** Retourne l'image optimisée (Blob) d'un identifiant, ou undefined. */
  getImageBlob: (id: string) => Blob | undefined;
  entitlements?: Entitlements;
  onProgress?: (p: ExportProgress) => void;
  signal?: AbortSignal;
  date?: Date;
}

const JPEG_QUALITY = 0.82;
const MAX_CANVAS_SIDE = 2400;

async function decode(blob: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(blob);
    } catch {
      // On tente la méthode classique ci-dessous.
    }
  }
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function sourceSize(src: ImageBitmap | HTMLImageElement) {
  return 'naturalWidth' in src
    ? { w: src.naturalWidth, h: src.naturalHeight }
    : { w: src.width, h: src.height };
}

function canvasToBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Conversion de la photo impossible.'));
          return;
        }
        blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)), reject);
      },
      'image/jpeg',
      JPEG_QUALITY,
    );
  });
}

/**
 * Compose une photo aux proportions exactes de son cadre :
 * - « cover » : recadrage centré, sans déformation ;
 * - « contain » : photo entière centrée sur un fond neutre.
 * La résolution dépend de la taille du cadre (dpi), sans agrandir une petite photo.
 */
export async function composeImage(
  src: ImageBitmap | HTMLImageElement,
  op: ImageOp,
  dpi: number,
): Promise<Uint8Array> {
  const { w: sw, h: sh } = sourceSize(src);
  const scale = dpi / 72;
  let cw = Math.max(1, Math.round(op.w * scale));
  let ch = Math.max(1, Math.round(op.h * scale));
  const limit = Math.min(1, MAX_CANVAS_SIDE / Math.max(cw, ch));
  cw = Math.round(cw * limit);
  ch = Math.round(ch * limit);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Votre navigateur ne permet pas de préparer les photos.');

  if (op.fit === 'cover') {
    const target = cw / ch;
    let cropW = sw;
    let cropH = sh;
    if (sw / sh > target) cropW = sh * target;
    else cropH = sw / target;
    // Inutile d'agrandir une petite photo : on garde sa résolution d'origine.
    if (cropW < cw) {
      const k = cropW / cw;
      cw = Math.max(1, Math.round(cw * k));
      ch = Math.max(1, Math.round(ch * k));
    }
    canvas.width = cw;
    canvas.height = ch;
    ctx.fillStyle = op.bg;
    ctx.fillRect(0, 0, cw, ch);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(src, (sw - cropW) / 2, (sh - cropH) / 2, cropW, cropH, 0, 0, cw, ch);
  } else {
    canvas.width = cw;
    canvas.height = ch;
    ctx.fillStyle = op.bg;
    ctx.fillRect(0, 0, cw, ch);
    const k = Math.min(cw / sw, ch / sh);
    const dw = sw * k;
    const dh = sh * k;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(src, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }
  const bytes = await canvasToBytes(canvas);
  canvas.width = 0;
  canvas.height = 0;
  return bytes;
}

export async function generateCatalogPdf(options: ExportOptions): Promise<ExportResult> {
  const { data, getImageBlob, onProgress, signal } = options;
  const rights = options.entitlements ?? getEntitlements();
  const date = options.date ?? new Date();
  const report = (phase: ExportPhase, percent: number, message: string) =>
    onProgress?.({ phase, percent: Math.round(Math.max(0, Math.min(100, percent))), message });
  const checkAbort = () => {
    if (signal?.aborted) throw new DOMException('Génération annulée', 'AbortError');
  };

  report('layout', 2, 'Mise en page du catalogue…');
  const availableImages = new Set<string>();
  for (const p of data.products)
    if (p.imageId && getImageBlob(p.imageId)) availableImages.add(p.imageId);
  if (data.shop.logoId && getImageBlob(data.shop.logoId)) availableImages.add(data.shop.logoId);

  const result = layoutCatalog(data, {
    availableImages,
    watermark: rights.watermark ? WATERMARK_TEXT : null,
    maxProducts: rights.maxProductsPerExport,
    date,
  });
  const { layout } = result;
  if (layout.productCount === 0) {
    throw new Error('Ajoutez au moins un produit avec un nom et un prix avant de créer le PDF.');
  }

  // 1. Préparation des photos, une photo source à la fois (économie de mémoire sur téléphone).
  const imageOps = new Map<string, ImageOp[]>();
  for (const page of layout.pages) {
    for (const op of page.ops) {
      if (op.kind !== 'image') continue;
      const list = imageOps.get(op.imageId) ?? [];
      if (!list.some((o) => imageKey(o) === imageKey(op))) list.push(op);
      imageOps.set(op.imageId, list);
    }
  }
  const prepared = new Map<string, PreparedImage>();
  const ids = [...imageOps.keys()];
  for (let i = 0; i < ids.length; i++) {
    checkAbort();
    const id = ids[i];
    report(
      'images',
      5 + (i / Math.max(1, ids.length)) * 65,
      `Préparation des photos (${i + 1} sur ${ids.length})…`,
    );
    const blob = getImageBlob(id);
    if (!blob) continue;
    let src: ImageBitmap | HTMLImageElement | null = null;
    try {
      src = await decode(blob);
      for (const op of imageOps.get(id)!) {
        prepared.set(imageKey(op), {
          data: await composeImage(src, op, rights.imageDpi),
          format: 'JPEG',
        });
      }
    } catch {
      // Photo illisible : un emplacement neutre sera dessiné à la place, le PDF reste utilisable.
    } finally {
      if (src && 'close' in src) src.close();
    }
  }

  // 2. Création du PDF.
  checkAbort();
  report('pages', 72, 'Création des pages…');
  const { jsPDF } = await import('jspdf');
  const orientation = layout.width > layout.height ? 'landscape' : 'portrait';
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation, compress: true });
  const shopName = data.shop.name.trim() || 'Ma boutique';
  doc.setProperties({
    title: `Catalogue — ${shopName}`,
    subject: `Catalogue de ${layout.productCount} produits`,
    author: shopName,
    creator: 'Catalogue Express',
    keywords: 'catalogue, produits, prix',
  });
  doc.setLanguage?.('fr-FR');

  await renderLayout(
    doc,
    layout,
    async (_op, key) => prepared.get(key) ?? null,
    ({ page, totalPages }) =>
      report(
        'pages',
        72 + (page / totalPages) * 22,
        `Création des pages (${page} sur ${totalPages})…`,
      ),
    signal,
  );

  report('finalize', 96, 'Finalisation du fichier…');
  checkAbort();
  const blob = doc.output('blob');
  report('finalize', 100, 'Votre catalogue est prêt.');

  return {
    blob,
    fileName: catalogFileName(data.shop.name, date),
    pageCount: layout.pages.length,
    productCount: layout.productCount,
    overLimitCount: result.overLimitCount,
    incompleteCount: result.incompleteCount,
    removedCharacters: result.removedCharacters,
  };
}
