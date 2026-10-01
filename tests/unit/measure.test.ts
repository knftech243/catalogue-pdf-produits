import { describe, expect, it } from 'vitest';
import { fitLine, measureText, sanitizeForPdf, wrapText } from '../../src/pdf/measure';

describe('sanitizeForPdf', () => {
  it('conserve les accents français et les symboles courants', () => {
    const text = 'Crème brûlée à 12,50 € — « naturel » œuf ç Ÿ';
    expect(sanitizeForPdf(text)).toEqual({ text, removed: false });
  });
  it('retire les émojis et le signale', () => {
    const res = sanitizeForPdf('Promo 🔥 du jour 😍 !');
    expect(res.removed).toBe(true);
    expect(res.text).toBe('Promo du jour !');
  });
  it("remplace l'espace fine insécable par une espace insécable", () => {
    expect(sanitizeForPdf('25\u202F000').text).toBe('25\u00A0000');
  });
  it('translittère les lettres accentuées hors alphabet PDF', () => {
    // « Ș » et « ź » deviennent « S » et « z » ; « Ł » (sans lettre de base) est retiré ; « ó » existe.
    const res = sanitizeForPdf('Ștefan Łódź');
    expect(res.text).toBe('Stefan ódz');
    expect(res.removed).toBe(true);
  });
});

describe('wrapText', () => {
  const width = 120;
  it('ne dépasse jamais la largeur disponible', () => {
    const { lines } = wrapText(
      'Robe longue en tissu wax cent pour cent coton, coupe évasée et ceinture assortie',
      'helvetica',
      9,
      width,
    );
    expect(lines.length).toBeGreaterThan(1);
    for (const l of lines) expect(measureText(l, 'helvetica', 9)).toBeLessThanOrEqual(width + 0.01);
  });
  it('termine par « … » quand le texte est trop long', () => {
    const res = wrapText(
      'un deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze',
      'helvetica',
      10,
      80,
      {
        maxLines: 2,
      },
    );
    expect(res.lines).toHaveLength(2);
    expect(res.truncated).toBe(true);
    expect(res.lines[1].endsWith('…')).toBe(true);
    expect(measureText(res.lines[1], 'helvetica', 10)).toBeLessThanOrEqual(80.01);
  });
  it('coupe un mot trop long au lieu de déborder', () => {
    const { lines } = wrapText('Supercalifragilisticexpialidocious', 'helvetica-bold', 12, 60);
    expect(lines.length).toBeGreaterThan(1);
    for (const l of lines) expect(measureText(l, 'helvetica-bold', 12)).toBeLessThanOrEqual(60.01);
  });
  it('respecte les retours à la ligne', () => {
    expect(wrapText('Ligne 1\nLigne 2', 'helvetica', 10, 200).lines).toEqual([
      'Ligne 1',
      'Ligne 2',
    ]);
  });
  it('renvoie une liste vide pour un texte vide', () => {
    expect(wrapText('   ', 'helvetica', 10, 200).lines).toEqual([]);
  });
});

describe('fitLine', () => {
  it('réduit la taille avant de raccourcir', () => {
    const res = fitLine('Boutique Mwinda', 'helvetica-bold', 20, 10, 130);
    expect(res.size).toBeLessThan(20);
    expect(res.text).toBe('Boutique Mwinda');
  });
  it('raccourcit avec « … » en dernier recours', () => {
    const res = fitLine('Un nom de boutique vraiment très très long', 'helvetica', 12, 10, 60);
    expect(res.size).toBe(10);
    expect(res.text.endsWith('…')).toBe(true);
  });
});
