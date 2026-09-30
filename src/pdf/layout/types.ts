// Opérations de dessin produites par le moteur de mise en page.
// Unité : le point typographique (1/72 de pouce). Origine en haut à gauche, y vers le bas.
// Les mêmes opérations sont rendues en SVG (aperçu) et avec jsPDF (fichier PDF).

import type { FontKey } from '../measure';
import type {
  CatalogSettings,
  Density,
  ImageFit,
  Orientation,
  Product,
  ShopInfo,
  TemplateId,
} from '../../core/types';

export interface RectOp {
  kind: 'rect';
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: string;
  stroke?: string;
  lineWidth?: number;
  /** Rayon des coins arrondis. */
  r?: number;
  opacity?: number;
}

export interface EllipseOp {
  kind: 'ellipse';
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  fill?: string;
  stroke?: string;
  lineWidth?: number;
  opacity?: number;
}

export interface LineOp {
  kind: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
  dash?: [number, number];
}

export interface TextOp {
  kind: 'text';
  /** Position de départ (gauche) de la ligne de base. */
  x: number;
  y: number;
  text: string;
  font: FontKey;
  size: number;
  color: string;
  charSpace?: number;
  opacity?: number;
  /** Rotation en degrés (sens inverse des aiguilles d'une montre), autour de (x, y). */
  angle?: number;
}

export interface ImageOp {
  kind: 'image';
  x: number;
  y: number;
  w: number;
  h: number;
  imageId: string;
  /** cover = remplit la zone (recadrage centré) ; contain = photo entière. */
  fit: ImageFit;
  /** Couleur de fond visible autour d'une photo entière et dans les coins arrondis. */
  bg: string;
  r?: number;
  shape?: 'rect' | 'circle';
}

export interface LinkOp {
  kind: 'link';
  x: number;
  y: number;
  w: number;
  h: number;
  url: string;
}

export type DrawOp = RectOp | EllipseOp | LineOp | TextOp | ImageOp | LinkOp;

export interface LayoutPage {
  ops: DrawOp[];
}

export interface LayoutResult {
  width: number;
  height: number;
  pages: LayoutPage[];
  /** Nombre de produits réellement placés dans le catalogue. */
  productCount: number;
}

/** Données prêtes à mettre en page (textes déjà nettoyés pour le PDF). */
export interface LayoutInput {
  shop: ShopInfo;
  products: Product[];
  settings: CatalogSettings;
  /** Identifiants des images disponibles (les autres sont traitées comme absentes). */
  availableImages: ReadonlySet<string>;
  /** Texte du filigrane (version de démonstration) ou null. */
  watermark: string | null;
  date: Date;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GridSpec {
  cols: number;
  rows: number;
}

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  tagline: string;
  description: string;
  /** Couleur conseillée pour ce modèle. */
  recommendedColor: string;
  idealFor: string[];
  grid(orientation: Orientation, density: Density): GridSpec;
  layout(input: LayoutInput): LayoutResult;
}
