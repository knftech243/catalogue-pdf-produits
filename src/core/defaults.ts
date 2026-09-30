import type { CatalogData, CatalogSettings, Product, ShopInfo } from './types';

export const DEFAULT_PRIMARY_COLOR = '#2447D5';

export function createEmptyShop(): ShopInfo {
  return {
    name: '',
    slogan: '',
    owner: '',
    whatsapp: '',
    phone: '',
    email: '',
    address: '',
    instagram: '',
    facebook: '',
    currency: { code: 'USD', customSymbol: '', customPosition: 'after' },
    primaryColor: DEFAULT_PRIMARY_COLOR,
    logoId: null,
  };
}

export function createDefaultSettings(): CatalogSettings {
  return {
    templateId: 'minimal',
    orientation: 'portrait',
    density: 'medium',
    showDescription: true,
    showOldPrice: true,
    showContact: true,
    showDetails: true,
    groupByCategory: false,
    imageFit: 'cover',
    sort: 'manual',
    whatsappLinks: true,
    coverTitle: 'Catalogue',
  };
}

export function createEmptyCatalog(): CatalogData {
  return {
    version: 1,
    shop: createEmptyShop(),
    products: [],
    settings: createDefaultSettings(),
  };
}

let counter = 0;
/** Identifiant unique local (pas besoin de crypto : les données ne sortent pas de l'appareil). */
export function createId(prefix = 'id'): string {
  counter = (counter + 1) % 1_000_000;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

export function createEmptyProduct(): Product {
  return {
    id: createId('p'),
    name: '',
    price: null,
    oldPrice: null,
    description: '',
    category: '',
    reference: '',
    availability: '',
    imageId: null,
  };
}

export const AVAILABILITY_LABELS: Record<Product['availability'], string> = {
  '': 'Non précisée',
  in_stock: 'En stock',
  limited: 'Stock limité',
  on_order: 'Sur commande',
  sold_out: 'Épuisé',
};

export const LIMITS = {
  /** Nombre maximal de produits dans l'éditeur (limite technique, mémoire du téléphone). */
  maxProductsInEditor: 200,
  nameMaxLength: 80,
  descriptionMaxLength: 220,
  categoryMaxLength: 40,
  referenceMaxLength: 30,
  shopNameMaxLength: 60,
  sloganMaxLength: 100,
  coverTitleMaxLength: 40,
  /** Taille maximale d'une photo importée (avant optimisation). */
  maxImageBytes: 25 * 1024 * 1024,
} as const;
