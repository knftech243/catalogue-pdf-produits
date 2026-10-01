// Affichage des pages d'un catalogue mis en page (aperçu à l'écran, dans l'outil de création).

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

export function PageList({
  layout,
  resolveImage,
  idPrefix,
  pages,
  shopName,
  className,
}: PageListProps) {
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
