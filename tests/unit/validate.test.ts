// Récupération des données locales : réglages invalides, sauvegardes partielles ou corrompues.

import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDefaultSettings, createEmptyShop, LIMITS } from '../../src/core/defaults';
import {
  normalizeCatalog,
  normalizeProducts,
  normalizeSettings,
  normalizeShop,
} from '../../src/core/validate';
import {
  CATALOG_BACKUP_KEY,
  CATALOG_KEY,
  clearAllLocalData,
  loadPrefs,
  loadStoredCatalog,
  PREFS_KEY,
} from '../../src/creator/storage';
import { layoutCatalog } from '../../src/pdf/layout';
import { makeCatalog } from './helpers';

const DEFAULTS = createDefaultSettings();

describe('normalizeSettings — réglages invalides', () => {
  it('densité invalide : seule la densité reprend sa valeur par défaut', () => {
    const settings = normalizeSettings({ ...DEFAULTS, density: 'enorme', templateId: 'food' });
    expect(settings.density).toBe(DEFAULTS.density);
    expect(settings.templateId).toBe('food');
  });

  it('valeurs inconnues : chaque champ est corrigé indépendamment', () => {
    const settings = normalizeSettings({
      templateId: 'magazine',
      orientation: 'carre',
      density: 3,
      sort: 'au-hasard',
      imageFit: 'etirer',
      showDescription: 'oui',
      showOldPrice: false,
      showContact: 0,
      showDetails: null,
      groupByCategory: true,
      whatsappLinks: 'false',
      coverTitle: { titre: 'x' },
    });
    expect(settings).toEqual({
      ...DEFAULTS,
      showOldPrice: false,
      groupByCategory: true,
    });
  });

  it('conserve des réglages valides tels quels', () => {
    const valid = {
      ...DEFAULTS,
      templateId: 'beauty' as const,
      orientation: 'landscape' as const,
      density: 'small' as const,
      sort: 'price-desc' as const,
      imageFit: 'contain' as const,
      coverTitle: 'Menu du jour',
    };
    expect(normalizeSettings(valid)).toEqual(valid);
  });

  it('titre de couverture trop long : raccourci à la limite', () => {
    const settings = normalizeSettings({ coverTitle: 'x'.repeat(500) });
    expect(settings.coverTitle).toHaveLength(LIMITS.coverTitleMaxLength);
  });

  it.each([null, undefined, 'texte', 42, [], [1, 2]])(
    'réglages illisibles (%j) : valeurs par défaut',
    (raw) => {
      expect(normalizeSettings(raw)).toEqual(DEFAULTS);
    },
  );

  it('le moteur ne plante plus avec une densité ou un modèle inconnu', () => {
    const data = makeCatalog(12);
    data.settings = {
      ...data.settings,
      density: 'enorme',
      templateId: 'inconnu',
      orientation: '?',
    } as never;
    const { layout, productCount } = layoutCatalog(data, {
      availableImages: new Set(),
      watermark: null,
      maxProducts: 50,
    });
    expect(productCount).toBe(12);
    // Valeurs par défaut : Minimal clair, portrait, 9 produits par page → couverture + 2 pages.
    expect(layout.pages).toHaveLength(3);
    expect(layout.width).toBeLessThan(layout.height);
  });
});

describe('normalizeShop / normalizeProducts — données partielles', () => {
  it('boutique : champs valides conservés, champs invalides remplacés un par un', () => {
    const shop = normalizeShop({
      name: 'Kiese Mode',
      slogan: 12,
      whatsapp: { numero: '+243' },
      currency: { code: 'BTC', customSymbol: 'GNF', customPosition: 'milieu' },
      primaryColor: 'rouge',
      logoId: 7,
    });
    const empty = createEmptyShop();
    expect(shop.name).toBe('Kiese Mode');
    expect(shop.slogan).toBe('12');
    expect(shop.whatsapp).toBe(empty.whatsapp);
    expect(shop.currency).toEqual({
      code: empty.currency.code,
      customSymbol: 'GNF',
      customPosition: empty.currency.customPosition,
    });
    expect(shop.primaryColor).toBe(empty.primaryColor);
    expect(shop.logoId).toBeNull();
  });

  it('produits : aucun produit exploitable perdu, identifiants réparés', () => {
    const products = normalizeProducts([
      { id: 'a', name: 'Robe', price: 25, imageId: 'img1' },
      { id: 'a', name: 'Robe (doublon d’identifiant)', price: '12,50' },
      { name: 'Sans identifiant', price: -3, oldPrice: Number.NaN },
      'pas un produit',
      null,
      { id: 'b', name: { x: 1 }, price: 'abc', availability: 'bientot', imageId: 5 },
    ]);
    expect(products).toHaveLength(4);
    expect(products[0]).toMatchObject({ id: 'a', name: 'Robe', price: 25, imageId: 'img1' });
    expect(products[1].id).not.toBe('a');
    expect(products[1].price).toBe(12.5);
    expect(products[2].id).toBeTruthy();
    expect(products[2].price).toBeNull();
    expect(products[2].oldPrice).toBeNull();
    expect(products[3]).toMatchObject({
      id: 'b',
      name: '',
      price: null,
      availability: '',
      imageId: null,
    });
    expect(new Set(products.map((p) => p.id)).size).toBe(4);
  });

  it('produits : liste trop longue limitée au maximum de l’éditeur', () => {
    const many = Array.from({ length: LIMITS.maxProductsInEditor + 25 }, (_, i) => ({
      id: `p${i}`,
      name: 'x',
      price: 1,
    }));
    expect(normalizeProducts(many)).toHaveLength(LIMITS.maxProductsInEditor);
  });

  it('catalogue partiel : seuls les morceaux absents reprennent leurs valeurs par défaut', () => {
    const data = normalizeCatalog({
      version: 1,
      shop: { name: 'Épicerie' },
      products: [{ id: 'x', name: 'Riz', price: 11.9 }],
      settings: { density: 'geant', templateId: 'fashion' },
    });
    expect(data?.shop.name).toBe('Épicerie');
    expect(data?.products).toHaveLength(1);
    expect(data?.settings.templateId).toBe('fashion');
    expect(data?.settings.density).toBe(DEFAULTS.density);
    expect(normalizeCatalog({ version: 1 })).toMatchObject({ products: [], settings: DEFAULTS });
  });

  it.each([null, 'texte', [], { version: 2 }, { shop: {} }])(
    'catalogue non reconnu (%j) : null',
    (raw) => {
      expect(normalizeCatalog(raw)).toBeNull();
    },
  );
});

describe('sauvegarde locale — lecture sûre', () => {
  class MemoryStorage {
    data = new Map<string, string>();
    failOn: string | null = null;
    get length() {
      return this.data.size;
    }
    key(i: number) {
      return [...this.data.keys()][i] ?? null;
    }
    getItem(k: string) {
      return this.data.has(k) ? this.data.get(k)! : null;
    }
    setItem(k: string, v: string) {
      if (k === this.failOn) throw new DOMException('Plein', 'QuotaExceededError');
      this.data.set(k, String(v));
    }
    removeItem(k: string) {
      this.data.delete(k);
    }
    clear() {
      this.data.clear();
    }
  }

  function useStorage() {
    const storage = new MemoryStorage();
    vi.stubGlobal('window', { localStorage: storage });
    return storage;
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('aucune sauvegarde : statut « none »', () => {
    useStorage();
    expect(loadStoredCatalog()).toEqual({ status: 'none', data: null, backupSaved: false });
  });

  it('sauvegarde avec réglages corrompus : relue, réglages corrigés, données conservées', () => {
    const storage = useStorage();
    const saved = makeCatalog(3);
    storage.setItem(
      CATALOG_KEY,
      JSON.stringify({ ...saved, settings: { ...saved.settings, density: 'enorme', sort: 7 } }),
    );
    const result = loadStoredCatalog();
    expect(result.status).toBe('ok');
    expect(result.data?.settings.density).toBe(DEFAULTS.density);
    expect(result.data?.settings.sort).toBe(DEFAULTS.sort);
    expect(result.data?.shop.name).toBe(saved.shop.name);
    expect(result.data?.products.map((p) => p.imageId)).toEqual(
      saved.products.map((p) => p.imageId),
    );
    expect(storage.getItem(CATALOG_BACKUP_KEY)).toBeNull();
  });

  it('sauvegarde illisible : nouveau départ, copie de secours, original non effacé', () => {
    const storage = useStorage();
    storage.setItem(CATALOG_KEY, '{"version":1,"shop":');
    const result = loadStoredCatalog();
    expect(result).toEqual({ status: 'unreadable', data: null, backupSaved: true });
    expect(storage.getItem(CATALOG_BACKUP_KEY)).toBe('{"version":1,"shop":');
    expect(storage.getItem(CATALOG_KEY)).toBe('{"version":1,"shop":');
  });

  it('sauvegarde d’une autre version : traitée comme illisible, sans suppression', () => {
    const storage = useStorage();
    storage.setItem(CATALOG_KEY, JSON.stringify({ version: 99, shop: { name: 'Futur' } }));
    expect(loadStoredCatalog().status).toBe('unreadable');
    expect(storage.getItem(CATALOG_KEY)).toContain('Futur');
  });

  it('espace plein pour la copie de secours : l’original reste en place', () => {
    const storage = useStorage();
    storage.setItem(CATALOG_KEY, 'pas du json');
    storage.failOn = CATALOG_BACKUP_KEY;
    expect(loadStoredCatalog()).toEqual({ status: 'unreadable', data: null, backupSaved: false });
    expect(storage.getItem(CATALOG_KEY)).toBe('pas du json');
  });

  it('préférences : seul un vrai booléen est accepté', () => {
    const storage = useStorage();
    storage.setItem(PREFS_KEY, JSON.stringify({ autosave: false }));
    expect(loadPrefs().autosave).toBe(false);
    storage.setItem(PREFS_KEY, JSON.stringify({ autosave: 'false' }));
    expect(loadPrefs().autosave).toBe(true);
    storage.setItem(PREFS_KEY, '{abîmé');
    expect(loadPrefs().autosave).toBe(true);
    storage.setItem(PREFS_KEY, 'null');
    expect(loadPrefs().autosave).toBe(true);
  });

  it('« Effacer mes données locales » retire aussi la copie de secours', async () => {
    const storage = useStorage();
    storage.setItem(CATALOG_KEY, 'x');
    storage.setItem(CATALOG_BACKUP_KEY, 'y');
    await clearAllLocalData();
    expect(storage.getItem(CATALOG_KEY)).toBeNull();
    expect(storage.getItem(CATALOG_BACKUP_KEY)).toBeNull();
  });
});
