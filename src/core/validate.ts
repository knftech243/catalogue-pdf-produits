// Validation des données relues depuis l'appareil (sauvegarde locale ancienne, abîmée ou modifiée).
// Principe : chaque champ invalide est remplacé par SA valeur par défaut, les champs valides sont
// conservés. Aucune donnée n'est supprimée pour corriger un seul réglage.

import { TEMPLATE_ORDER } from '../pdf/layout/meta';
import { normalizeHex } from './color';
import {
  AVAILABILITY_LABELS,
  createDefaultSettings,
  createEmptyShop,
  createId,
  LIMITS,
} from './defaults';
import { CURRENCIES, parsePrice } from './price';
import {
  DENSITIES,
  IMAGE_FITS,
  ORIENTATIONS,
  SORT_MODES,
  SYMBOL_POSITIONS,
  type Availability,
  type CatalogData,
  type CatalogSettings,
  type CurrencySettings,
  type Product,
  type ShopInfo,
} from './types';

type Raw = Record<string, unknown>;

function isRecord(value: unknown): value is Raw {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Valeur gardée seulement si elle fait partie de la liste autorisée. */
function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

/** Texte : un nombre est converti, tout autre type reprend la valeur par défaut. */
function text(value: unknown, fallback: string, maxLength?: number): string {
  const result =
    typeof value === 'string'
      ? value
      : typeof value === 'number' && Number.isFinite(value)
        ? String(value)
        : fallback;
  return maxLength ? result.slice(0, maxLength) : result;
}

/** Prix positif ou nul ; un texte (« 12,50 ») est relu comme à la saisie ; sinon « à compléter ». */
function price(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : null;
  if (typeof value === 'string') return parsePrice(value);
  return null;
}

function optionalId(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

const CURRENCY_CODES = CURRENCIES.map((c) => c.code);
const AVAILABILITIES = Object.keys(AVAILABILITY_LABELS) as Availability[];

export function normalizeSettings(raw: unknown): CatalogSettings {
  const d = createDefaultSettings();
  const s = isRecord(raw) ? raw : {};
  return {
    templateId: oneOf(s.templateId, TEMPLATE_ORDER, d.templateId),
    orientation: oneOf(s.orientation, ORIENTATIONS, d.orientation),
    density: oneOf(s.density, DENSITIES, d.density),
    showDescription: bool(s.showDescription, d.showDescription),
    showOldPrice: bool(s.showOldPrice, d.showOldPrice),
    showContact: bool(s.showContact, d.showContact),
    showDetails: bool(s.showDetails, d.showDetails),
    groupByCategory: bool(s.groupByCategory, d.groupByCategory),
    imageFit: oneOf(s.imageFit, IMAGE_FITS, d.imageFit),
    sort: oneOf(s.sort, SORT_MODES, d.sort),
    whatsappLinks: bool(s.whatsappLinks, d.whatsappLinks),
    coverTitle: text(s.coverTitle, d.coverTitle, LIMITS.coverTitleMaxLength),
  };
}

function normalizeCurrency(raw: unknown, fallback: CurrencySettings): CurrencySettings {
  const c = isRecord(raw) ? raw : {};
  return {
    code: oneOf(c.code, CURRENCY_CODES, fallback.code),
    customSymbol: text(c.customSymbol, fallback.customSymbol),
    customPosition: oneOf(c.customPosition, SYMBOL_POSITIONS, fallback.customPosition),
  };
}

export function normalizeShop(raw: unknown): ShopInfo {
  const d = createEmptyShop();
  const s = isRecord(raw) ? raw : {};
  return {
    name: text(s.name, d.name, LIMITS.shopNameMaxLength),
    slogan: text(s.slogan, d.slogan, LIMITS.sloganMaxLength),
    owner: text(s.owner, d.owner),
    whatsapp: text(s.whatsapp, d.whatsapp),
    phone: text(s.phone, d.phone),
    email: text(s.email, d.email),
    address: text(s.address, d.address),
    instagram: text(s.instagram, d.instagram),
    facebook: text(s.facebook, d.facebook),
    currency: normalizeCurrency(s.currency, d.currency),
    primaryColor: normalizeHex(
      typeof s.primaryColor === 'string' ? s.primaryColor : '',
      d.primaryColor,
    ),
    logoId: optionalId(s.logoId),
  };
}

/**
 * Produits : chaque élément exploitable est conservé, même incomplet (il apparaîtra « à compléter »).
 * Les identifiants manquants ou en double sont régénérés pour ne perdre aucun produit.
 */
export function normalizeProducts(raw: unknown): Product[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const products: Product[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    if (products.length >= LIMITS.maxProductsInEditor) break;
    let id = optionalId(item.id);
    if (!id || seen.has(id)) id = createId('p');
    seen.add(id);
    products.push({
      id,
      name: text(item.name, '', LIMITS.nameMaxLength),
      price: price(item.price),
      oldPrice: price(item.oldPrice),
      description: text(item.description, '', LIMITS.descriptionMaxLength),
      category: text(item.category, '', LIMITS.categoryMaxLength),
      reference: text(item.reference, '', LIMITS.referenceMaxLength),
      availability: oneOf(item.availability, AVAILABILITIES, ''),
      imageId: optionalId(item.imageId),
    });
  }
  return products;
}

/**
 * Catalogue complet. Retourne null si les données ne sont pas un catalogue reconnaissable
 * (illisible ou d'une autre version) : l'appelant décide alors de repartir d'un catalogue neuf.
 */
export function normalizeCatalog(raw: unknown): CatalogData | null {
  if (!isRecord(raw) || raw.version !== 1) return null;
  return {
    version: 1,
    shop: normalizeShop(raw.shop),
    products: normalizeProducts(raw.products),
    settings: normalizeSettings(raw.settings),
  };
}
