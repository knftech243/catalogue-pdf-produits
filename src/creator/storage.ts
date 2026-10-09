// Sauvegarde locale : textes dans localStorage, photos dans IndexedDB.
// Rien n'est envoyé sur Internet. Tout peut être effacé depuis l'outil.

import type { CatalogData, StoredImage } from '../core/types';
import { normalizeCatalog } from '../core/validate';

export const CATALOG_KEY = 'catalogue-express:v1:catalog';
/** Copie brute d'une sauvegarde illisible, conservée sur l'appareil au lieu d'être perdue. */
export const CATALOG_BACKUP_KEY = 'catalogue-express:v1:catalog-backup';
export const PREFS_KEY = 'catalogue-express:v1:prefs';
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
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    const autosave =
      parsed && typeof parsed === 'object' && 'autosave' in parsed ? parsed.autosave : undefined;
    // Seul un vrai booléen est accepté (le texte « false » ne doit pas être compris comme « oui »).
    return { autosave: typeof autosave === 'boolean' ? autosave : DEFAULT_PREFS.autosave };
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

export type LoadStatus =
  /** Aucune sauvegarde sur l'appareil. */
  | 'none'
  /** Sauvegarde relue ; les champs invalides éventuels ont été remplacés un par un. */
  | 'ok'
  /** Sauvegarde présente mais illisible : l'outil repart d'un catalogue neuf. */
  | 'unreadable';

export interface LoadResult {
  status: LoadStatus;
  data: CatalogData | null;
  /** Vrai si une copie de la sauvegarde illisible a pu être conservée sur l'appareil. */
  backupSaved: boolean;
}

/**
 * Relit le catalogue enregistré et le valide champ par champ (src/core/validate.ts).
 * Une sauvegarde illisible n'est jamais effacée ici : elle est copiée dans une clé de secours
 * avant d'être remplacée, plus tard, par la sauvegarde automatique.
 */
export function loadStoredCatalog(): LoadResult {
  const ls = safeLocalStorage();
  if (!ls) return { status: 'none', data: null, backupSaved: false };
  let raw: string | null = null;
  try {
    raw = ls.getItem(CATALOG_KEY);
  } catch {
    return { status: 'none', data: null, backupSaved: false };
  }
  if (!raw) return { status: 'none', data: null, backupSaved: false };
  let data: CatalogData | null = null;
  try {
    data = normalizeCatalog(JSON.parse(raw));
  } catch {
    data = null;
  }
  if (data) return { status: 'ok', data, backupSaved: false };
  let backupSaved = false;
  try {
    ls.setItem(CATALOG_BACKUP_KEY, raw);
    backupSaved = true;
  } catch {
    // Espace insuffisant : la sauvegarde d'origine reste en place jusqu'à la prochaine modification.
  }
  return { status: 'unreadable', data: null, backupSaved };
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
    ls?.removeItem(CATALOG_BACKUP_KEY);
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
