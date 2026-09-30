import { createDefaultSettings, createEmptyShop } from '../../src/core/defaults';
import type { CatalogData, Product } from '../../src/core/types';

/** JPEG valide de 1 × 1 pixel (tests Node : pas de canvas). */
export const TINY_JPEG = Uint8Array.from(
  atob(
    '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
  ),
  (c) => c.charCodeAt(0),
);

export function makeProducts(count: number, overrides: Partial<Product> = {}): Product[] {
  const categories = ['Robes', 'Chaussures', 'Accessoires', 'Boissons'];
  return Array.from({ length: count }, (_, i) => ({
    id: `p${i + 1}`,
    name: `Produit numéro ${i + 1}`,
    price: 10 + i * 2.5,
    oldPrice: i % 4 === 0 ? 20 + i * 2.5 : null,
    description: 'Description courte du produit, avec des accents : é, è, à, ç, ô, œ.',
    category: categories[i % categories.length],
    reference: `REF-${i + 1}`,
    availability: (['in_stock', 'limited', 'on_order', 'sold_out', ''] as const)[i % 5],
    imageId: i % 3 === 2 ? null : `img${i + 1}`,
    ...overrides,
  }));
}

export function makeCatalog(count: number, patch: Partial<CatalogData> = {}): CatalogData {
  return {
    version: 1,
    shop: {
      ...createEmptyShop(),
      name: 'Boutique Test Élégance',
      slogan: 'Le meilleur pour vous, à petit prix',
      whatsapp: '+243 00 000 0000',
      phone: '+243 00 000 0001',
      email: 'test@example.com',
      address: 'Kinshasa, Gombe',
      instagram: '@boutique.test',
    },
    products: makeProducts(count),
    settings: createDefaultSettings(),
    ...patch,
  };
}

export function imageIds(data: CatalogData): Set<string> {
  const ids = new Set<string>();
  for (const p of data.products) if (p.imageId) ids.add(p.imageId);
  if (data.shop.logoId) ids.add(data.shop.logoId);
  return ids;
}
