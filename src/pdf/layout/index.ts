import type { CatalogData, TemplateId } from '../../core/types';
import { prepareLayoutInput, type PrepareOptions, type PreparedInput } from '../prepare';
import { beautyTemplate } from './templates/beauty';
import { fashionTemplate } from './templates/fashion';
import { foodTemplate } from './templates/food';
import { minimalTemplate } from './templates/minimal';
import type { LayoutResult, TemplateDefinition } from './types';

export { productsPerPage, TEMPLATE_META } from './meta';

export const TEMPLATES: TemplateDefinition[] = [
  minimalTemplate,
  fashionTemplate,
  beautyTemplate,
  foodTemplate,
];

export function getTemplate(id: TemplateId): TemplateDefinition {
  return TEMPLATES.find((t) => t.id === id) ?? minimalTemplate;
}

export interface CatalogLayout extends Omit<PreparedInput, 'input'> {
  layout: LayoutResult;
  /** Nombre de produits placés dans le catalogue. */
  productCount: number;
}

/** Met en page tout le catalogue (couverture + pages produits). */
export function layoutCatalog(data: CatalogData, options: PrepareOptions): CatalogLayout {
  const { input, ...info } = prepareLayoutInput(data, options);
  const layout = getTemplate(data.settings.templateId).layout(input);
  return { layout, productCount: layout.productCount, ...info };
}
