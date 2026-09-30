// Outils texte : noms de fichiers, dates en français, liens WhatsApp.

const MONTHS_FR = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

export function monthYearFr(date: Date): string {
  return `${MONTHS_FR[date.getMonth()]} ${date.getFullYear()}`;
}

export function capitalize(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

/** Retire les accents : « Épicerie Maman Rose » → « Epicerie Maman Rose ». */
export function stripAccents(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function slugify(text: string, maxLength = 50): string {
  const slug = stripAccents(text)
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.slice(0, maxLength).replace(/-+$/g, '');
}

function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Nom du fichier final : catalogue-nom-de-la-boutique-2026-09-30.pdf */
export function catalogFileName(shopName: string, date: Date = new Date()): string {
  const slug = slugify(shopName) || 'ma-boutique';
  return `catalogue-${slug}-${isoDate(date)}.pdf`;
}

/**
 * Normalise un numéro WhatsApp pour un lien wa.me.
 * Le numéro doit être au format international (+243…, 00243…). Retourne null sinon.
 */
export function whatsappDigits(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const international = trimmed.startsWith('+') || trimmed.startsWith('00');
  const digits = trimmed.replace(/\D/g, '').replace(/^00/, '');
  if (!international) return null;
  if (digits.length < 8 || digits.length > 15) return null;
  return digits;
}

export function whatsappLink(input: string, message?: string): string | null {
  const digits = whatsappDigits(input);
  if (!digits) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${text}`;
}

/** Transforme « @maboutique » ou « instagram.com/maboutique » en URL complète. */
export function socialUrl(kind: 'instagram' | 'facebook', input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const handle = value.replace(/^@/, '').replace(/^(www\.)?(instagram|facebook)\.com\//i, '');
  if (!/^[\w.\-/]+$/.test(handle)) return null;
  return kind === 'instagram'
    ? `https://instagram.com/${handle}`
    : `https://facebook.com/${handle}`;
}

/** Libellé court pour un réseau social : « @maboutique ». */
export function socialLabel(input: string): string {
  const value = input.trim();
  const match = value.match(/(?:instagram|facebook)\.com\/([^/?#]+)/i);
  const handle = match ? match[1] : value.replace(/^@/, '');
  return handle ? `@${handle}` : '';
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`;
}
