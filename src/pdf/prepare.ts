// Prépare les données du catalogue pour la mise en page : nettoyage des textes, tri, limites.

import type { CatalogData, Product, ShopInfo } from '../core/types';
import { sanitizeForPdf } from './measure';
import type { LayoutInput } from './layout/types';

export function isProductComplete(p: Product): boolean {
  return p.name.trim().length > 0 && p.price != null && Number.isFinite(p.price) && p.price >= 0;
}

const collator = new Intl.Collator('fr', { sensitivity: 'base', numeric: true });

export function sortProducts(products: Product[], sort: CatalogData['settings']['sort']): Product[] {
  const list = [...products];
  switch (sort) {
    case 'name':
      return list.sort((a, b) => collator.compare(a.name.trim(), b.name.trim()));
    case 'price-asc':
      return list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    case 'price-desc':
      return list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    default:
      return list;
  }
}

export interface PrepareOptions {
  availableImages: ReadonlySet<string>;
  watermark: string | null;
  maxProducts: number;
  date?: Date;
}

export interface PreparedInput {
  input: LayoutInput;
  /** Vrai si des caractères non pris en charge (émojis…) ont été retirés. */
  removedCharacters: boolean;
  /** Produits exclus car incomplets (nom ou prix manquant). */
  incompleteCount: number;
  /** Produits exclus à cause de la limite de l'offre. */
  overLimitCount: number;
}

export function prepareLayoutInput(data: CatalogData, options: PrepareOptions): PreparedInput {
  let removed = false;
  const clean = (text: string) => {
    const res = sanitizeForPdf(text ?? '');
    if (res.removed) removed = true;
    return res.text.trim();
  };
  // Les textes sur une ligne ne doivent pas contenir de retour à la ligne.
  const cleanLine = (text: string) => clean(text.replace(/\s*\n\s*/g, ' '));

  const s = data.shop;
  const shop: ShopInfo = {
    ...s,
    name: cleanLine(s.name) || 'Ma boutique',
    slogan: clean(s.slogan),
    owner: cleanLine(s.owner),
    whatsapp: cleanLine(s.whatsapp),
    phone: cleanLine(s.phone),
    email: cleanLine(s.email),
    address: cleanLine(s.address),
    instagram: cleanLine(s.instagram),
    facebook: cleanLine(s.facebook),
    currency: { ...s.currency, customSymbol: cleanLine(s.currency.customSymbol) },
  };

  const complete = data.products.filter(isProductComplete);
  const sorted = sortProducts(complete, data.settings.sort);
  const limited = sorted.slice(0, Math.max(0, options.maxProducts));
  const products = limited.map((p) => ({
    ...p,
    name: cleanLine(p.name),
    description: clean(p.description),
    category: cleanLine(p.category),
    reference: cleanLine(p.reference),
  }));

  return {
    input: {
      shop,
      products,
      settings: { ...data.settings, coverTitle: cleanLine(data.settings.coverTitle) || 'Catalogue' },
      availableImages: options.availableImages,
      watermark: options.watermark,
      date: options.date ?? new Date(),
    },
    removedCharacters: removed,
    incompleteCount: data.products.length - complete.length,
    overLimitCount: sorted.length - limited.length,
  };
}
