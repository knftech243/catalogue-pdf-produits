// Informations descriptives des modèles (sans code de mise en page) : utilisables par les pages
// du site sans charger le moteur PDF.

import type { Density, Orientation, TemplateId } from '../../core/types';
import type { GridSpec } from './types';

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  tagline: string;
  description: string;
  /** Couleur conseillée pour ce modèle. */
  recommendedColor: string;
  idealFor: string[];
  grid(orientation: Orientation, density: Density): GridSpec;
}

const g = (cols: number, rows: number): GridSpec => ({ cols, rows });

export const TEMPLATE_META: Record<TemplateId, TemplateMeta> = {
  minimal: {
    id: 'minimal',
    name: 'Minimal clair',
    tagline: 'Sobre, aéré, efficace',
    description:
      'Fond blanc, filets fins et prix en couleur. Convient à tous les commerces et met les photos en valeur sans distraction.',
    recommendedColor: '#2447D5',
    idealFor: ['Accessoires', 'Électronique', 'Tous commerces'],
    grid: (o, d) =>
      o === 'portrait'
        ? { large: g(2, 2), medium: g(3, 3), small: g(4, 4) }[d]
        : { large: g(4, 2), medium: g(5, 2), small: g(6, 3) }[d],
  },
  fashion: {
    id: 'fashion',
    name: 'Mode élégante',
    tagline: 'Chic, raffiné, magazine',
    description:
      'Fond crème, lettres à empattements et grandes photos verticales, comme un magazine de mode. Idéal pour les vêtements, chaussures et bijoux.',
    recommendedColor: '#9C6B3C',
    idealFor: ['Vêtements', 'Chaussures', 'Bijoux'],
    grid: (o, d) =>
      o === 'portrait'
        ? { large: g(2, 2), medium: g(3, 2), small: g(4, 3) }[d]
        : { large: g(3, 1), medium: g(4, 2), small: g(6, 2) }[d],
  },
  beauty: {
    id: 'beauty',
    name: 'Cosmétiques moderne',
    tagline: 'Doux, lumineux, tendance',
    description:
      'Fond teinté, cartes blanches arrondies et prix en pastille colorée. Parfait pour les cosmétiques, parfums et soins.',
    recommendedColor: '#C8416F',
    idealFor: ['Cosmétiques', 'Parfums', 'Soins'],
    grid: (o, d) =>
      o === 'portrait'
        ? { large: g(2, 2), medium: g(3, 3), small: g(4, 4) }[d]
        : { large: g(4, 2), medium: g(5, 2), small: g(6, 3) }[d],
  },
  food: {
    id: 'food',
    name: 'Épicerie et restauration colorée',
    tagline: 'Gourmand, lisible, coloré',
    description:
      'Bandeau de couleur, fiches horizontales et prix sur étiquette jaune. Idéal pour les menus de restaurant, fast-foods et listes de prix d’épicerie.',
    recommendedColor: '#D2452B',
    idealFor: ['Restaurants', 'Fast-foods', 'Épiceries'],
    grid: (o, d) =>
      o === 'portrait'
        ? { large: g(1, 5), medium: g(2, 6), small: g(2, 8) }[d]
        : { large: g(2, 3), medium: g(2, 4), small: g(3, 5) }[d],
  },
};

export const TEMPLATE_ORDER: TemplateId[] = ['minimal', 'fashion', 'beauty', 'food'];

export function productsPerPage(
  id: TemplateId,
  orientation: Orientation,
  density: Density,
): number {
  const grid = TEMPLATE_META[id].grid(orientation, density);
  return grid.cols * grid.rows;
}
