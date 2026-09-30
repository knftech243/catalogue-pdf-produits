// Transforme une boutique de démonstration en données de catalogue.

import type { CatalogData, Product } from '../core/types';
import { illustrationDataUrl } from './illustrations';
import { DEMO_SHOPS, getDemoShop, type DemoId, type DemoShop } from './shops';

export interface DemoCatalog {
  data: CatalogData;
  /** Illustration SVG (data URL) de chaque image, par identifiant. */
  images: Map<string, string>;
  demo: DemoShop;
}

export function demoCatalog(id: DemoId): DemoCatalog {
  const demo = getDemoShop(id);
  const images = new Map<string, string>();
  const products: Product[] = demo.products.map((p, i) => {
    const imageId = `demo-${demo.id}-${i + 1}`;
    images.set(imageId, illustrationDataUrl(p.art));
    return {
      id: `demo-${demo.id}-p${i + 1}`,
      name: p.name,
      price: p.price,
      oldPrice: p.oldPrice ?? null,
      description: p.description,
      category: p.category,
      reference: p.reference ?? '',
      availability: p.availability ?? '',
      imageId,
    };
  });
  return {
    data: { version: 1, shop: { ...demo.shop }, products, settings: { ...demo.settings } },
    images,
    demo,
  };
}

export const DEMO_IDS: DemoId[] = DEMO_SHOPS.map((s) => s.id);
