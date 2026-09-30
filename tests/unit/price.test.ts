import { describe, expect, it } from 'vitest';
import { discountPercent, formatNumber, formatPrice, parsePrice } from '../../src/core/price';
import type { CurrencySettings } from '../../src/core/types';

const cur = (code: CurrencySettings['code'], customSymbol = '', customPosition: 'before' | 'after' = 'after'): CurrencySettings => ({
  code,
  customSymbol,
  customPosition,
});
const plain = (s: string) => s.replace(/ /g, ' ');

describe('parsePrice', () => {
  it.each([
    ['12', 12],
    ['12,5', 12.5],
    ['12.50', 12.5],
    ['25 000', 25000],
    ['25000', 25000],
    ['1 250,75', 1250.75],
    ['1.250,75', 1250.75],
    ['1,250.75', 1250.75],
    ['12.500', 12500],
    ['0,99', 0.99],
    ['0.5', 0.5],
    ['15 $', 15],
    ['5 000 FCFA', 5000],
    ['1.250.000', 1250000],
    [',5', 0.5],
    ['12,999', 12999],
  ])('lit « %s » → %s', (input, expected) => {
    expect(parsePrice(input)).toBe(expected);
  });

  it.each(['', 'abc', '-5', '12,5,3.2.1x-', '   '])('refuse « %s »', (input) => {
    expect(parsePrice(input)).toBeNull();
  });

  it('arrondit à deux décimales', () => {
    expect(parsePrice('12,345')).toBe(12345); // trois chiffres = milliers
    expect(parsePrice('12,3456')).toBe(12.35);
  });
});

describe('formatPrice', () => {
  it('USD par défaut, décimales seulement si nécessaire', () => {
    expect(plain(formatPrice(25, cur('USD')))).toBe('25 $');
    expect(plain(formatPrice(12.5, cur('USD')))).toBe('12,50 $');
    expect(plain(formatPrice(1299.9, cur('USD')))).toBe('1 299,90 $');
  });

  it('CDF, EUR, FCFA', () => {
    expect(plain(formatPrice(25000, cur('CDF')))).toBe('25 000 FC');
    expect(plain(formatPrice(7.5, cur('EUR')))).toBe('7,50 €');
    expect(plain(formatPrice(5000, cur('FCFA')))).toBe('5 000 FCFA');
  });

  it('symbole personnalisé avant ou après', () => {
    expect(plain(formatPrice(12500, cur('CUSTOM', 'GNF', 'after')))).toBe('12 500 GNF');
    expect(plain(formatPrice(12500, cur('CUSTOM', 'GNF', 'before')))).toBe('GNF 12 500');
    expect(plain(formatPrice(10, cur('CUSTOM', '', 'before')))).toBe('10');
  });

  it('utilise des espaces insécables (le prix ne se coupe jamais)', () => {
    expect(formatPrice(25000, cur('CDF'))).toBe('25 000 FC');
  });

  it('formatNumber gère les grands nombres', () => {
    expect(plain(formatNumber(1234567.891))).toBe('1 234 567,89');
  });
});

describe('discountPercent', () => {
  it('calcule la réduction', () => {
    expect(discountPercent(12, 15)).toBe(20);
    expect(discountPercent(45, 55)).toBe(18);
  });
  it('ignore les cas sans promotion', () => {
    expect(discountPercent(15, 12)).toBeNull();
    expect(discountPercent(15, 15)).toBeNull();
    expect(discountPercent(null, 15)).toBeNull();
    expect(discountPercent(10, null)).toBeNull();
  });
});
