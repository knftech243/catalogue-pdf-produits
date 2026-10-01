// Charge une boutique de démonstration dans l'éditeur : illustrations converties en photos JPEG.

import { createId } from '../core/defaults';
import type { CatalogData, StoredImage } from '../core/types';
import { demoCatalog } from '../demo/catalog';
import type { DemoId } from '../demo/shops';
import { rasterizeSvg } from './imageProcessing';

export async function buildDemo(
  id: DemoId,
  onProgress?: (done: number, total: number) => void,
): Promise<{ data: CatalogData; images: StoredImage[] }> {
  const demo = demoCatalog(id);
  const images: StoredImage[] = [];
  const idMap = new Map<string, string>();
  const entries = [...demo.images.entries()];
  for (let i = 0; i < entries.length; i++) {
    const [oldId, url] = entries[i];
    const processed = await rasterizeSvg(url);
    const newId = createId('img');
    idMap.set(oldId, newId);
    images.push({ id: newId, ...processed });
    onProgress?.(i + 1, entries.length);
  }
  const data: CatalogData = {
    ...demo.data,
    products: demo.data.products.map((p) => ({
      ...p,
      id: createId('p'),
      imageId: p.imageId ? (idMap.get(p.imageId) ?? null) : null,
    })),
  };
  return { data, images };
}
