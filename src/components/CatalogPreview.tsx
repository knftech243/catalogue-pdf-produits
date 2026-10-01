// Affichage des pages d'un catalogue mis en page (aperçu à l'écran).

import { useMemo } from 'react';
import { demoCatalog } from '../demo/catalog';
import type { DemoId } from '../demo/shops';
import type { Orientation, TemplateId } from '../core/types';
import { layoutCatalog } from '../pdf/layout';
import type { LayoutResult } from '../pdf/layout/types';
import { SvgPage } from '../pdf/preview/SvgPage';

interface PageListProps {
  layout: LayoutResult;
  resolveImage: (id: string) => string | undefined;
  idPrefix: string;
  /** Indices des pages à afficher (toutes par défaut). */
  pages?: number[];
  shopName: string;
  className?: string;
}

export function PageList({ layout, resolveImage, idPrefix, pages, shopName, className }: PageListProps) {
  const indices = pages ?? layout.pages.map((_, i) => i);
  const total = layout.pages.length;
  return (
    <div className={`page-list ${className ?? ''}`}>
      {indices
        .filter((i) => i < total)
        .map((i) => (
          <figure
            key={i}
            className={`pdf-page-frame ${layout.width > layout.height ? 'is-landscape' : 'is-portrait'}`}
          >
            <SvgPage
              className="pdf-page"
              page={layout.pages[i]}
              width={layout.width}
              height={layout.height}
              resolveImage={resolveImage}
              idPrefix={`${idPrefix}-p${i}`}
              label={
                i === 0
                  ? `Couverture du catalogue ${shopName}`
                  : `Page ${i + 1} sur ${total} du catalogue ${shopName}`
              }
            />
            <figcaption>{i === 0 ? 'Couverture' : `Page ${i + 1} / ${total}`}</figcaption>
          </figure>
        ))}
    </div>
  );
}

interface DemoPreviewProps {
  demoId: DemoId;
  templateId?: TemplateId;
  orientation?: Orientation;
  pages?: number[];
  className?: string;
}

/** Aperçu d'un catalogue de démonstration, calculé avec le même moteur que le PDF. */
export function DemoPreview({ demoId, templateId, orientation, pages = [0, 1], className }: DemoPreviewProps) {
  const { layout, images, name } = useMemo(() => {
    const demo = demoCatalog(demoId);
    const data = {
      ...demo.data,
      settings: {
        ...demo.data.settings,
        ...(templateId ? { templateId } : {}),
        ...(orientation ? { orientation } : {}),
      },
    };
    const result = layoutCatalog(data, {
      availableImages: new Set(demo.images.keys()),
      watermark: null,
      maxProducts: 200,
      date: new Date(2026, 8, 1),
    });
    return { layout: result.layout, images: demo.images, name: demo.data.shop.name };
  }, [demoId, templateId, orientation]);

  return (
    <PageList
      layout={layout}
      resolveImage={(id) => images.get(id)}
      idPrefix={`demo-${demoId}-${templateId ?? 'd'}-${orientation ?? 'o'}`}
      pages={pages}
      shopName={name}
      className={className}
    />
  );
}
