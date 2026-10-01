// Sauvegarde locale : textes dans localStorage, photos dans IndexedDB.
// Rien n'est envoyé sur Internet. Tout peut être effacé depuis l'outil.

import { createEmptyCatalog, createDefaultSettings, createEmptyShop } from '../core/defaults';
import type { CatalogData, Product, StoredImage } from '../core/types';

const CATALOG_KEY = 'catalogue-express:v1:catalog';
const PREFS_KEY = 'catalogue-express:v1:prefs';
const DB_NAME = 'catalogue-express';
const DB_VERSION = 1;
const STORE = 'images';

export interface Prefs {
  autosave: boolean;
}

const DEFAULT_PREFS: Prefs = { autosave: true };

function safeLocalStorage(): Storage | null {
  try {
    const ls = window.localStorage;
    const probe = '__ce_probe__';
    ls.setItem(probe, '1');
    ls.removeItem(probe);
    return ls;
  } catch {
    return null;
  }
}

export function isLocalStorageAvailable(): boolean {
  return typeof window !== 'undefined' && safeLocalStorage() !== null;
}

export function loadPrefs(): Prefs {
  const ls = safeLocalStorage();
  if (!ls) return { ...DEFAULT_PREFS, autosave: false };
  try {
    const raw = ls.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : { ...DEFAULT_PREFS };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function savePrefs(prefs: Prefs): void {
  const ls = safeLocalStorage();
  try {
    ls?.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Stockage indisponible : la préférence ne sera simplement pas mémorisée.
  }
}

/** Vérifie et complète des données relues (anciennes versions, données abîmées). */
export function sanitizeCatalog(raw: unknown): CatalogData | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Partial<CatalogData>;
  if (obj.version !== 1) return null;
  const base = createEmptyCatalog();
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  const shop = { ...createEmptyShop(), ...(obj.shop ?? {}) };
  const products: Product[] = Array.isArray(obj.products)
    ? obj.products
        .filter(
          (p): p is Product =>
            !!p && typeof p === 'object' && typeof (p as Product).id === 'string',
        )
        .map((p) => ({
          id: p.id,
          name: str(p.name),
          price: num(p.price),
          oldPrice: num(p.oldPrice),
          description: str(p.description),
          category: str(p.category),
          reference: str(p.reference),
          availability: ['in_stock', 'limited', 'on_order', 'sold_out'].includes(p.availability)
            ? p.availability
            : '',
          imageId: typeof p.imageId === 'string' ? p.imageId : null,
        }))
    : [];
  return {
    version: 1,
    shop: {
      ...shop,
      currency: { ...base.shop.currency, ...(shop.currency ?? {}) },
      logoId: typeof shop.logoId === 'string' ? shop.logoId : null,
    },
    products,
    settings: { ...createDefaultSettings(), ...(obj.settings ?? {}) },
  };
}

export function loadCatalog(): CatalogData | null {
  const ls = safeLocalStorage();
  if (!ls) return null;
  try {
    const raw = ls.getItem(CATALOG_KEY);
    return raw ? sanitizeCatalog(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export type SaveResult = 'ok' | 'quota' | 'unavailable';

export function saveCatalog(data: CatalogData): SaveResult {
  const ls = safeLocalStorage();
  if (!ls) return 'unavailable';
  try {
    ls.setItem(CATALOG_KEY, JSON.stringify(data));
    return 'ok';
  } catch {
    return 'quota';
  }
}

// ---------- IndexedDB (photos) ----------

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB indisponible'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Ouverture de la base locale impossible'));
    req.onblocked = () => reject(new Error('Base locale bloquée'));
  });
  dbPromise.catch(() => {
    dbPromise = null;
  });
  return dbPromise;
}

function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | void> {
  return openDb().then(
    (db) =>
      new Promise<T | void>((resolve, reject) => {
        const transaction = db.transaction(STORE, mode);
        const store = transaction.objectStore(STORE);
        const req = run(store);
        transaction.oncomplete = () => resolve(req ? (req.result as T) : undefined);
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      }),
  );
}

export async function putImage(image: StoredImage): Promise<boolean> {
  try {
    await tx('readwrite', (s) => s.put(image));
    return true;
  } catch {
    return false;
  }
}

export async function deleteImage(id: string): Promise<void> {
  try {
    await tx('readwrite', (s) => s.delete(id));
  } catch {
    // Rien à faire : l'image sera ignorée au prochain chargement.
  }
}

export async function loadImages(): Promise<StoredImage[]> {
  try {
    const all = await tx<StoredImage[]>('readonly', (s) => s.getAll());
    return Array.isArray(all)
      ? all.filter((i) => i && i.blob instanceof Blob && i.thumb instanceof Blob)
      : [];
  } catch {
    return [];
  }
}

/** Efface toutes les données locales de Catalogue Express sur cet appareil. */
export async function clearAllLocalData(): Promise<void> {
  const ls = safeLocalStorage();
  try {
    ls?.removeItem(CATALOG_KEY);
  } catch {
    // ignoré
  }
  try {
    await tx('readwrite', (s) => s.clear());
  } catch {
    // ignoré
  }
}

/** Estimation de l'espace utilisé (si le navigateur le permet). */
export async function estimateUsage(): Promise<number | null> {
  try {
    const est = await navigator.storage?.estimate?.();
    return est?.usage ?? null;
  } catch {
    return null;
  }
}
