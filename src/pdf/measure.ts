// Mesure et découpage du texte avec les métriques officielles des polices standard PDF.
// Utilisé à la fois par l'aperçu (SVG) et par le PDF : les retours à la ligne sont identiques.

import { FONT_WIDTHS } from './fontMetrics';

export type FontKey =
  | 'helvetica'
  | 'helvetica-bold'
  | 'helvetica-oblique'
  | 'helvetica-boldoblique'
  | 'times'
  | 'times-bold'
  | 'times-italic'
  | 'times-bolditalic';

const ELLIPSIS = '…';
/** Tolérance d'arrondi : évite de raccourcir un texte qui tient exactement dans sa zone. */
const EPS = 0.01;

/** Remplacements des caractères absents de l'encodage WinAnsi des polices PDF standard. */
const REPLACEMENTS: Record<string, string> = {
  ' ': ' ', // espace fine insécable (utilisée par Intl en français)
  ' ': ' ',
  ' ': ' ',
  ' ': ' ',
  ' ': ' ',
  '​': '',
  '‐': '-',
  '‑': '-',
  '‒': '-',
  '−': '-',
  '′': "'",
  '″': '"',
  '­': '',
  '\t': ' ',
};

export interface SanitizeResult {
  text: string;
  /** Vrai si des caractères non affichables (émojis, alphabets non latins…) ont été retirés. */
  removed: boolean;
}

/** Rend un texte compatible avec les polices standard du PDF (accents français conservés). */
export function sanitizeForPdf(input: string): SanitizeResult {
  const widths = FONT_WIDTHS.helvetica;
  let removed = false;
  let out = '';
  for (const ch of input.normalize('NFC')) {
    if (ch === '\n') {
      out += ch;
      continue;
    }
    if (ch in REPLACEMENTS) {
      out += REPLACEMENTS[ch];
      continue;
    }
    const cp = ch.codePointAt(0) ?? 0;
    if (widths[cp] !== undefined) {
      out += ch;
      continue;
    }
    // Lettre accentuée hors WinAnsi (ex. « ș », « ł ») : on garde la lettre de base.
    const base = ch.normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (base && base !== ch && [...base].every((c) => widths[c.codePointAt(0) ?? 0] !== undefined)) {
      out += base;
      continue;
    }
    // Sélecteurs de variation et liants d'émojis : retirés sans signalement supplémentaire.
    if (/[︎️‍]/.test(ch)) continue;
    removed = true;
  }
  // Nettoyage des espaces multiples laissés par des émojis retirés.
  const text = out.replace(/[ ]{2,}/g, ' ').replace(/ +\n/g, '\n');
  return { text, removed };
}

export function pdfText(input: string): string {
  return sanitizeForPdf(input).text;
}

/** Largeur d'un texte en points. */
export function measureText(text: string, font: FontKey, size: number, charSpace = 0): number {
  const widths = FONT_WIDTHS[font];
  let total = 0;
  let count = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    total += widths[cp] ?? widths[63] ?? 500; // 63 = « ? »
    count++;
  }
  return (total * size) / 1000 + charSpace * Math.max(0, count - 1);
}

/** Coupe un mot trop long pour la largeur disponible. */
function breakLongWord(word: string, font: FontKey, size: number, maxWidth: number): string[] {
  const parts: string[] = [];
  let current = '';
  for (const ch of word) {
    if (current && measureText(current + ch, font, size) > maxWidth + EPS) {
      parts.push(current);
      current = ch;
    } else {
      current += ch;
    }
  }
  if (current) parts.push(current);
  return parts;
}

/** Ajoute « … » en raccourcissant la ligne pour qu'elle tienne dans la largeur. */
export function ellipsize(line: string, font: FontKey, size: number, maxWidth: number, charSpace = 0): string {
  if (measureText(line, font, size, charSpace) <= maxWidth + EPS) return line;
  const chars = [...line];
  while (chars.length > 0) {
    chars.pop();
    const candidate = chars.join('').replace(/[\s,.;:–-]+$/, '') + ELLIPSIS;
    if (measureText(candidate, font, size, charSpace) <= maxWidth + EPS) return candidate;
  }
  return '';
}

export interface WrapOptions {
  maxLines?: number;
  charSpace?: number;
}

export interface WrapResult {
  lines: string[];
  /** Vrai si le texte a été raccourci (points de suspension). */
  truncated: boolean;
}

/**
 * Découpe un texte en lignes qui tiennent dans maxWidth.
 * Au-delà de maxLines, la dernière ligne se termine par « … » : aucun texte ne déborde.
 */
export function wrapText(
  text: string,
  font: FontKey,
  size: number,
  maxWidth: number,
  options: WrapOptions = {},
): WrapResult {
  const { maxLines = Infinity, charSpace = 0 } = options;
  const lines: string[] = [];
  const paragraphs = text.split('\n');
  let truncated = false;

  outer: for (let p = 0; p < paragraphs.length; p++) {
    const words = paragraphs[p].split(/ +/).filter((w) => w.length > 0);
    if (words.length === 0) {
      if (p > 0 && p < paragraphs.length - 1 && lines.length > 0) lines.push('');
      continue;
    }
    let current = '';
    for (const rawWord of words) {
      const pieces =
        measureText(rawWord, font, size, charSpace) > maxWidth + EPS
          ? breakLongWord(rawWord, font, size, maxWidth)
          : [rawWord];
      for (const word of pieces) {
        const candidate = current ? `${current} ${word}` : word;
        if (measureText(candidate, font, size, charSpace) <= maxWidth + EPS) {
          current = candidate;
        } else {
          lines.push(current);
          current = word;
          if (lines.length >= maxLines) {
            truncated = true;
            break outer;
          }
        }
      }
    }
    if (current) {
      lines.push(current);
      if (lines.length >= maxLines && p < paragraphs.length - 1) {
        truncated = paragraphs.slice(p + 1).some((para) => para.trim().length > 0);
        break;
      }
    }
  }

  // Retire les lignes vides en fin de texte.
  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();

  if (lines.length > maxLines) {
    lines.length = maxLines;
    truncated = true;
  }
  if (truncated && lines.length > 0) {
    const last = lines.length - 1;
    lines[last] = ellipsize(`${lines[last]}${ELLIPSIS}`, font, size, maxWidth, charSpace);
  }
  return { lines, truncated };
}

export interface FitResult {
  text: string;
  size: number;
}

/** Réduit la taille de police (jusqu'à minSize) pour faire tenir une ligne, sinon « … ». */
export function fitLine(
  text: string,
  font: FontKey,
  maxSize: number,
  minSize: number,
  maxWidth: number,
  charSpace = 0,
): FitResult {
  let size = maxSize;
  while (size > minSize && measureText(text, font, size, charSpace) > maxWidth + EPS) {
    size = Math.max(minSize, size - 0.5);
  }
  return { text: ellipsize(text, font, size, maxWidth, charSpace), size };
}
