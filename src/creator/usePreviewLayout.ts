import { useMemo } from 'react';
import { getEntitlements, WATERMARK_TEXT } from '../config/plans';
import type { CatalogData } from '../core/types';
import { layoutCatalog } from '../pdf/layout';
import type { ImageEntry } from './state';

/** Mise en page du catalogue pour l'aperçu (mêmes règles que le PDF, filigrane compris). */
export function usePreviewLayout(data: CatalogData, images: Map<string, ImageEntry>, withWatermark = true) {
  return useMemo(() => {
    const rights = getEntitlements();
    const available = new Set(images.keys());
    const result = layoutCatalog(data, {
      availableImages: available,
      watermark: withWatermark && rights.watermark ? WATERMARK_TEXT : null,
      maxProducts: rights.maxProductsPerExport,
    });
    return {
      ...result,
      resolveImage: (id: string) => images.get(id)?.thumbUrl,
    };
  }, [data, images, withWatermark]);
}
