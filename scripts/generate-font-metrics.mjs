// Génère src/pdf/fontMetrics.ts : largeurs officielles (AFM) des polices standard PDF.
//
// Pourquoi : jsPDF n'embarque pas les polices standard (Helvetica, Times). Le lecteur PDF utilise
// donc les métriques officielles Adobe (AFM). En utilisant ces mêmes largeurs pour l'aperçu et pour
// la mise en page, les retours à la ligne sont identiques à l'écran et dans le PDF.
// Les métriques AFM sont lues depuis pdf-lib (dépendance de développement uniquement).
//
// Usage : npm run fonts:metrics

import { PDFDocument, StandardFonts } from 'pdf-lib';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const FONTS = {
  helvetica: StandardFonts.Helvetica,
  'helvetica-bold': StandardFonts.HelveticaBold,
  'helvetica-oblique': StandardFonts.HelveticaOblique,
  'helvetica-boldoblique': StandardFonts.HelveticaBoldOblique,
  times: StandardFonts.TimesRoman,
  'times-bold': StandardFonts.TimesRomanBold,
  'times-italic': StandardFonts.TimesRomanItalic,
  'times-bolditalic': StandardFonts.TimesRomanBoldItalic,
};

// Caractères de l'encodage WinAnsi (Windows-1252) utilisé par les polices standard.
const codePoints = [];
for (let c = 32; c <= 126; c++) codePoints.push(c);
for (let c = 160; c <= 255; c++) codePoints.push(c);
const extra = [
  0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030, 0x0160, 0x2039, 0x0152,
  0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a,
  0x0153, 0x017e, 0x0178,
];
codePoints.push(...extra);

const pdf = await PDFDocument.create();
const out = {};
for (const [key, name] of Object.entries(FONTS)) {
  const font = await pdf.embedFont(name);
  const widths = {};
  for (const cp of codePoints) {
    const ch = String.fromCodePoint(cp);
    // 0xAD (trait d'union conditionnel) n'a pas de glyphe visible : on le traite comme un tiret.
    const probe = cp === 0xad ? '-' : cp === 0xa0 ? ' ' : ch;
    widths[cp] = Math.round(font.widthOfTextAtSize(probe, 1000));
  }
  out[key] = widths;
}

const header = `// Fichier généré par scripts/generate-font-metrics.mjs — ne pas modifier à la main.
// Largeurs AFM des caractères (unités de 1/1000 de la taille de police) des polices standard PDF.
// L'aperçu et le PDF utilisent ces valeurs : les retours à la ligne sont donc identiques.
/* eslint-disable */
`;

const body = Object.entries(out)
  .map(([key, widths]) => {
    const entries = Object.entries(widths)
      .map(([cp, w]) => `${cp}:${w}`)
      .join(',');
    return `  '${key}': {${entries}},`;
  })
  .join('\n');

const file = `${header}export const FONT_WIDTHS: Record<string, Record<number, number>> = {\n${body}\n};\n`;
writeFileSync(join(root, 'src', 'pdf', 'fontMetrics.ts'), file, 'utf8');
console.log(
  `fontMetrics.ts généré (${codePoints.length} caractères × ${Object.keys(FONTS).length} polices).`,
);
