// Modèle de données du catalogue. Tout reste dans le navigateur de l'utilisateur.

export type CurrencyCode = 'USD' | 'CDF' | 'EUR' | 'FCFA' | 'CUSTOM';
export type SymbolPosition = 'before' | 'after';

export interface CurrencySettings {
  code: CurrencyCode;
  /** Symbole libre quand code === 'CUSTOM' (ex. « GNF », « DH », « F »). */
  customSymbol: string;
  customPosition: SymbolPosition;
}

export interface ShopInfo {
  name: string;
  slogan: string;
  owner: string;
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  instagram: string;
  facebook: string;
  currency: CurrencySettings;
  /** Couleur principale au format #RRGGBB. */
  primaryColor: string;
  /** Identifiant de l'image du logo (stockée à part), ou null. */
  logoId: string | null;
}

export type Availability = '' | 'in_stock' | 'limited' | 'on_order' | 'sold_out';

export interface Product {
  id: string;
  name: string;
  /** Prix en unités de la devise (null = non renseigné). */
  price: number | null;
  oldPrice: number | null;
  description: string;
  category: string;
  reference: string;
  availability: Availability;
  imageId: string | null;
}

export type TemplateId = 'minimal' | 'fashion' | 'beauty' | 'food';
export type Orientation = 'portrait' | 'landscape';
export type Density = 'large' | 'medium' | 'small';
export type SortMode = 'manual' | 'name' | 'price-asc' | 'price-desc';
export type ImageFit = 'cover' | 'contain';

export interface CatalogSettings {
  templateId: TemplateId;
  orientation: Orientation;
  density: Density;
  showDescription: boolean;
  showOldPrice: boolean;
  showContact: boolean;
  /** Référence et disponibilité sur les fiches produits. */
  showDetails: boolean;
  groupByCategory: boolean;
  imageFit: ImageFit;
  sort: SortMode;
  /** Liens WhatsApp cliquables dans le PDF (si un numéro international est fourni). */
  whatsappLinks: boolean;
  /** Titre affiché sur la couverture (ex. « Catalogue », « Menu », « Nouvelle collection »). */
  coverTitle: string;
}

export interface CatalogData {
  version: 1;
  shop: ShopInfo;
  products: Product[];
  settings: CatalogSettings;
}

/** Métadonnées d'une image traitée localement. */
export interface StoredImage {
  id: string;
  /** Image optimisée pour le PDF (JPEG ou PNG pour un logo transparent). */
  blob: Blob;
  /** Miniature légère pour l'affichage à l'écran. */
  thumb: Blob;
  width: number;
  height: number;
}
