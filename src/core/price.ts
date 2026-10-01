import type { CurrencyCode, CurrencySettings } from './types';

const NBSP = '\u00A0';

export interface CurrencyOption {
  code: CurrencyCode;
  label: string;
  symbol: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'USD', label: 'Dollar américain (USD)', symbol: '$' },
  { code: 'CDF', label: 'Franc congolais (CDF)', symbol: 'FC' },
  { code: 'EUR', label: 'Euro (EUR)', symbol: '€' },
  { code: 'FCFA', label: 'Franc CFA (FCFA)', symbol: 'FCFA' },
  { code: 'CUSTOM', label: 'Autre (symbole personnalisé)', symbol: '' },
];

export function currencySymbol(currency: CurrencySettings): string {
  if (currency.code === 'CUSTOM') return currency.customSymbol.trim();
  return CURRENCIES.find((c) => c.code === currency.code)?.symbol ?? '';
}

/**
 * Lit un prix saisi librement : « 12,50 », « 12.5 », « 25 000 », « 1 250,00 $ ».
 * Retourne null si la saisie n'est pas un prix valide.
 */
export function parsePrice(input: string): number | null {
  if (typeof input !== 'string') return null;
  const cleaned = input.replace(/[^\d.,-]/g, '');
  if (!cleaned || /-/.test(cleaned)) return null;
  if (!/\d/.test(cleaned)) return null;

  let normalized: string;
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');

  if (lastComma !== -1 && lastDot !== -1) {
    // Les deux séparateurs : le dernier est le séparateur décimal.
    const decimalSep = lastComma > lastDot ? ',' : '.';
    const thousandSep = decimalSep === ',' ? '.' : ',';
    normalized = cleaned.split(thousandSep).join('').replace(decimalSep, '.');
  } else if (lastComma !== -1 || lastDot !== -1) {
    const sep = lastComma !== -1 ? ',' : '.';
    const parts = cleaned.split(sep);
    if (parts.length > 2) {
      // « 1.250.000 » : séparateurs de milliers.
      normalized = parts.join('');
    } else {
      const decimals = parts[1] ?? '';
      // « 12.500 » ou « 1,250 » : trois chiffres après un séparateur unique = milliers.
      normalized =
        decimals.length === 3 && parts[0] !== '' && parts[0] !== '0'
          ? parts.join('')
          : parts.join('.');
    }
  } else {
    normalized = cleaned;
  }

  if (normalized.startsWith('.')) normalized = `0${normalized}`;
  if (normalized.endsWith('.')) normalized = normalized.slice(0, -1);
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;

  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0 || value > 1e12) return null;
  return Math.round(value * 100) / 100;
}

function groupThousands(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}

/** Formate un nombre à la française, décimales affichées seulement si nécessaires. */
export function formatNumber(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  const isInteger = Math.abs(rounded - Math.round(rounded)) < 1e-9;
  if (isInteger) return groupThousands(String(Math.round(rounded)));
  const [intPart, decPart] = rounded.toFixed(2).split('.');
  return `${groupThousands(intPart)},${decPart}`;
}

/** Formate un prix avec sa devise : « 12,50 $ », « 25 000 FC », « 5 000 FCFA ». */
export function formatPrice(value: number, currency: CurrencySettings): string {
  const number = formatNumber(value);
  const symbol = currencySymbol(currency);
  if (!symbol) return number;
  const position = currency.code === 'CUSTOM' ? currency.customPosition : 'after';
  return position === 'before' ? `${symbol}${NBSP}${number}` : `${number}${NBSP}${symbol}`;
}

/** Pourcentage de réduction arrondi (ex. 20 pour -20 %), ou null si pas de réduction. */
export function discountPercent(price: number | null, oldPrice: number | null): number | null {
  if (price == null || oldPrice == null || oldPrice <= 0 || oldPrice <= price) return null;
  const pct = Math.round(((oldPrice - price) / oldPrice) * 100);
  return pct >= 1 ? pct : null;
}
