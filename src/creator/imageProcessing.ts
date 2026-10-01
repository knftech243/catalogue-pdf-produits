// Traitement local des photos : vérification, redimensionnement et compression dans le navigateur.

import { LIMITS } from '../core/defaults';
import { formatBytes } from '../core/text';

export type ImageErrorCode = 'type' | 'heic' | 'size' | 'decode' | 'tiny';

export class ImageImportError extends Error {
  code: ImageErrorCode;
  constructor(code: ImageErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/avif'];
const ACCEPTED_EXT = /\.(jpe?g|png|webp|gif|bmp|avif)$/i;

export const ACCEPT_ATTRIBUTE = 'image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif';

export interface ProcessedImage {
  blob: Blob;
  thumb: Blob;
  width: number;
  height: number;
}

interface Options {
  /** Côté maximal de l'image conservée pour le PDF. */
  maxSide: number;
  thumbSide: number;
  /** Conserve la transparence (logo) en PNG si nécessaire. */
  keepTransparency: boolean;
}

export const PRODUCT_IMAGE: Options = { maxSide: 1600, thumbSide: 480, keepTransparency: false };
export const LOGO_IMAGE: Options = { maxSide: 800, thumbSide: 320, keepTransparency: true };

/** Vérifie le fichier avant tout traitement. Lève une erreur en français compréhensible. */
export function validateImageFile(file: File): void {
  const name = file.name || 'photo';
  const type = (file.type || '').toLowerCase();
  if (/heic|heif/.test(type) || /\.(heic|heif)$/i.test(name)) {
    throw new ImageImportError(
      'heic',
      `« ${name} » est au format HEIC (photo d’iPhone), non pris en charge par tous les navigateurs. Dans les réglages de l’appareil photo, choisissez « Le plus compatible » (JPEG), ou envoyez-vous la photo par WhatsApp puis réessayez.`,
    );
  }
  if (!(ACCEPTED.includes(type) || (!type && ACCEPTED_EXT.test(name)))) {
    throw new ImageImportError(
      'type',
      `« ${name} » n’est pas une photo prise en charge. Formats acceptés : JPEG, PNG, WebP ou GIF.`,
    );
  }
  if (file.size > LIMITS.maxImageBytes) {
    throw new ImageImportError(
      'size',
      `« ${name} » est trop lourde (${formatBytes(file.size)}). La taille maximale est de ${formatBytes(LIMITS.maxImageBytes)}. Essayez une photo plus légère ou une capture d’écran.`,
    );
  }
}

async function decodeFile(file: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      // « from-image » : respecte l'orientation des photos prises au téléphone.
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      // Méthode de secours ci-dessous.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function size(src: ImageBitmap | HTMLImageElement) {
  return 'naturalWidth' in src ? { w: src.naturalWidth, h: src.naturalHeight } : { w: src.width, h: src.height };
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Conversion impossible'))), type, quality),
  );
}

function hasTransparency(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
  try {
    const data = ctx.getImageData(0, 0, w, h).data;
    for (let i = 3; i < data.length; i += 16) if (data[i] < 250) return true;
  } catch {
    return false;
  }
  return false;
}

async function render(
  src: ImageBitmap | HTMLImageElement,
  maxSide: number,
  keepTransparency: boolean,
  quality: number,
): Promise<{ blob: Blob; w: number; h: number }> {
  const { w, h } = size(src);
  const k = Math.min(1, maxSide / Math.max(w, h));
  const tw = Math.max(1, Math.round(w * k));
  const th = Math.max(1, Math.round(h * k));
  const canvas = document.createElement('canvas');
  canvas.width = tw;
  canvas.height = th;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponible');
  ctx.imageSmoothingQuality = 'high';
  if (keepTransparency) {
    ctx.drawImage(src, 0, 0, tw, th);
    if (hasTransparency(ctx, tw, th)) {
      const blob = await toBlob(canvas, 'image/png');
      canvas.width = 0;
      return { blob, w: tw, h: th };
    }
  }
  // Les photos sont posées sur fond blanc (les zones transparentes ne deviennent pas noires).
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, tw, th);
  ctx.globalCompositeOperation = 'source-over';
  if (!keepTransparency) ctx.drawImage(src, 0, 0, tw, th);
  const blob = await toBlob(canvas, 'image/jpeg', quality);
  canvas.width = 0;
  return { blob, w: tw, h: th };
}

/** Importe une photo : vérification, correction de l'orientation, réduction et compression. */
export async function processImage(file: File, options: Options = PRODUCT_IMAGE): Promise<ProcessedImage> {
  validateImageFile(file);
  let src: ImageBitmap | HTMLImageElement;
  try {
    src = await decodeFile(file);
  } catch {
    throw new ImageImportError(
      'decode',
      `Impossible d’ouvrir « ${file.name || 'cette photo'} ». Le fichier est peut-être abîmé ou n’est pas une vraie photo. Essayez une autre photo.`,
    );
  }
  try {
    const { w, h } = size(src);
    if (w < 16 || h < 16) {
      throw new ImageImportError('tiny', `« ${file.name} » est trop petite (${w} × ${h} pixels) pour être utilisée.`);
    }
    const main = await render(src, options.maxSide, options.keepTransparency, 0.86);
    const thumb = await render(src, options.thumbSide, options.keepTransparency, 0.78);
    return { blob: main.blob, thumb: thumb.blob, width: main.w, height: main.h };
  } finally {
    if ('close' in src) src.close();
  }
}

/** Convertit une illustration SVG (données de démonstration) en photo JPEG. */
export async function rasterizeSvg(svgDataUrl: string, side = 900): Promise<ProcessedImage> {
  const img = new Image();
  img.src = svgDataUrl;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = side;
  canvas.height = side;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponible');
  ctx.drawImage(img, 0, 0, side, side);
  const blob = await toBlob(canvas, 'image/jpeg', 0.86);
  const small = document.createElement('canvas');
  small.width = 400;
  small.height = 400;
  small.getContext('2d')?.drawImage(canvas, 0, 0, 400, 400);
  const thumb = await toBlob(small, 'image/jpeg', 0.8);
  canvas.width = 0;
  small.width = 0;
  return { blob, thumb, width: side, height: side };
}
