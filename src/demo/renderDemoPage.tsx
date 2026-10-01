// Rendu SVG autonome d'une page de catalogue de démonstration (utilisé par les scripts de build :
// aperçus du site, image Open Graph, visuels marketing). Non chargé dans le navigateur.

import { renderToStaticMarkup } from 'react-dom/server';
import type { Orientation, TemplateId } from '../core/types';
import { layoutCatalog } from '../pdf/layout';
import { SvgPage } from '../pdf/preview/SvgPage';
import { demoCatalog } from './catalog';
import type { DemoId } from './shops';

/** Date fixe : les aperçus publiés ne changent pas à chaque build. */
export const DEMO_DATE = new Date(2026, 8, 1);

export function demoLayout(demoId: DemoId, templateId?: TemplateId, orientation?: Orientation) {
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
    date: DEMO_DATE,
  });
  return { ...result, images: demo.images, data };
}

/** SVG complet (avec dimensions) d'une page : utilisable comme fichier image. */
export function renderDemoPageSvg(demoId: DemoId, pageIndex: number, templateId?: TemplateId, orientation?: Orientation): string {
  const { layout, images, data } = demoLayout(demoId, templateId, orientation);
  const page = layout.pages[Math.min(pageIndex, layout.pages.length - 1)];
  const markup = renderToStaticMarkup(
    <SvgPage
      page={page}
      width={layout.width}
      height={layout.height}
      resolveImage={(id) => images.get(id)}
      idPrefix={`${demoId}-${pageIndex}`}
      label={`Page ${pageIndex + 1} du catalogue ${data.shop.name}`}
    />,
  );
  // Dimensions explicites pour un affichage correct en <img>.
  return markup.replace('<svg ', `<svg width="${Math.round(layout.width)}" height="${Math.round(layout.height)}" `);
}

export function demoPageCount(demoId: DemoId): number {
  return demoLayout(demoId).layout.pages.length;
}
