// État de l'outil de création : données du catalogue, photos en mémoire, sauvegarde locale.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createEmptyCatalog, createId, LIMITS } from '../core/defaults';
import type { CatalogData, CatalogSettings, Product, ShopInfo, StoredImage } from '../core/types';
import {
  clearAllLocalData,
  deleteImage,
  loadCatalog,
  loadImages,
  loadPrefs,
  putImage,
  saveCatalog,
  savePrefs,
  type Prefs,
} from './storage';

// ---------- Réducteur ----------

type Action =
  | { type: 'load'; data: CatalogData }
  | { type: 'shop'; patch: Partial<ShopInfo> }
  | { type: 'settings'; patch: Partial<CatalogSettings> }
  | { type: 'add'; products: Product[] }
  | { type: 'update'; id: string; patch: Partial<Product> }
  | { type: 'delete'; id: string }
  | { type: 'restore'; product: Product; index: number }
  | { type: 'duplicate'; id: string }
  | { type: 'move'; id: string; delta: -1 | 1 }
  | { type: 'reset' };

export function catalogReducer(state: CatalogData, action: Action): CatalogData {
  switch (action.type) {
    case 'load':
      return action.data;
    case 'shop':
      return { ...state, shop: { ...state.shop, ...action.patch } };
    case 'settings':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'add': {
      const room = LIMITS.maxProductsInEditor - state.products.length;
      if (room <= 0) return state;
      return { ...state, products: [...state.products, ...action.products.slice(0, room)] };
    }
    case 'update':
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.id ? { ...p, ...action.patch, id: p.id } : p,
        ),
      };
    case 'delete':
      return { ...state, products: state.products.filter((p) => p.id !== action.id) };
    case 'restore': {
      const products = [...state.products];
      products.splice(Math.min(action.index, products.length), 0, action.product);
      return { ...state, products };
    }
    case 'duplicate': {
      if (state.products.length >= LIMITS.maxProductsInEditor) return state;
      const index = state.products.findIndex((p) => p.id === action.id);
      if (index < 0) return state;
      const source = state.products[index];
      const copy: Product = {
        ...source,
        id: createId('p'),
        name: source.name ? `${source.name} (copie)`.slice(0, LIMITS.nameMaxLength) : '',
      };
      const products = [...state.products];
      products.splice(index + 1, 0, copy);
      return { ...state, products };
    }
    case 'move': {
      const index = state.products.findIndex((p) => p.id === action.id);
      const target = index + action.delta;
      if (index < 0 || target < 0 || target >= state.products.length) return state;
      const products = [...state.products];
      [products[index], products[target]] = [products[target], products[index]];
      return { ...state, products };
    }
    case 'reset':
      return createEmptyCatalog();
  }
}

// ---------- Photos en mémoire ----------

export interface ImageEntry extends StoredImage {
  /** URL locale (blob:) de la miniature, pour l'affichage. */
  thumbUrl: string;
}

export type SaveStatus = 'idle' | 'saved' | 'disabled' | 'error' | 'unavailable';

interface CreatorContextValue {
  data: CatalogData;
  ready: boolean;
  images: Map<string, ImageEntry>;
  prefs: Prefs;
  saveStatus: SaveStatus;
  setShop: (patch: Partial<ShopInfo>) => void;
  setSettings: (patch: Partial<CatalogSettings>) => void;
  addProducts: (products: Product[]) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  undoDelete: () => void;
  clearUndo: () => void;
  lastDeleted: { product: Product; index: number } | null;
  duplicateProduct: (id: string) => void;
  moveProduct: (id: string, delta: -1 | 1) => void;
  addImage: (image: StoredImage) => Promise<void>;
  /** Protège une photo en cours d'édition contre le nettoyage automatique. */
  pinImage: (id: string) => void;
  unpinImage: (id: string) => void;
  loadData: (data: CatalogData, images?: StoredImage[]) => Promise<void>;
  reset: () => Promise<void>;
  setAutosave: (enabled: boolean) => Promise<void>;
  clearLocalData: () => Promise<void>;
}

const CreatorContext = createContext<CreatorContextValue | null>(null);

export function useCreator(): CreatorContextValue {
  const ctx = useContext(CreatorContext);
  if (!ctx) throw new Error('useCreator doit être utilisé dans CreatorProvider');
  return ctx;
}

function toEntry(image: StoredImage): ImageEntry {
  return { ...image, thumbUrl: URL.createObjectURL(image.thumb) };
}

export function CreatorProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(catalogReducer, undefined, createEmptyCatalog);
  const [images, setImages] = useState<Map<string, ImageEntry>>(() => new Map());
  const [ready, setReady] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({ autosave: true });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastDeleted, setLastDeleted] = useState<{ product: Product; index: number } | null>(null);
  // Valeurs à jour pour les rappels et écouteurs d'événements (mises à jour après chaque rendu,
  // avant les autres effets déclarés plus bas).
  const imagesRef = useRef(images);
  const prefsRef = useRef(prefs);
  const dataRef = useRef(data);
  useEffect(() => {
    imagesRef.current = images;
    prefsRef.current = prefs;
    dataRef.current = data;
  });

  // Chargement initial des données enregistrées sur l'appareil.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const p = loadPrefs();
      setPrefs(p);
      if (p.autosave) {
        const saved = loadCatalog();
        if (saved) {
          const stored = await loadImages();
          if (cancelled) return;
          const map = new Map<string, ImageEntry>();
          for (const img of stored) map.set(img.id, toEntry(img));
          setImages(map);
          dispatch({ type: 'load', data: saved });
        }
      }
      if (!cancelled) {
        setReady(true);
        setSaveStatus(p.autosave ? 'saved' : 'disabled');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Libère les URL locales en quittant l'outil.
  useEffect(
    () => () => {
      for (const entry of imagesRef.current.values()) URL.revokeObjectURL(entry.thumbUrl);
    },
    [],
  );

  // Sauvegarde automatique (textes) avec un léger délai.
  const dirtyRef = useRef(false);
  useEffect(() => {
    if (!ready || !prefs.autosave) return;
    dirtyRef.current = true;
    const timer = window.setTimeout(() => {
      dirtyRef.current = false;
      const result = saveCatalog(data);
      setSaveStatus(result === 'ok' ? 'saved' : result === 'quota' ? 'error' : 'unavailable');
    }, 300);
    return () => window.clearTimeout(timer);
  }, [data, ready, prefs.autosave]);

  // Sauvegarde immédiate si la page est masquée ou fermée (changement d'application sur Android,
  // rechargement, fermeture de l'onglet) : aucune modification récente n'est perdue.
  useEffect(() => {
    if (!ready) return;
    const flush = () => {
      if (dirtyRef.current && prefsRef.current.autosave) {
        dirtyRef.current = false;
        saveCatalog(dataRef.current);
      }
    };
    const onVisibility = () => document.visibilityState === 'hidden' && flush();
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [ready]);

  // Photos « réservées » : en cours d'édition, pas encore rattachées à un produit.
  const pinnedRef = useRef(new Set<string>());
  const [gcTick, setGcTick] = useState(0);

  // Nettoyage des photos qui ne sont plus utilisées (sauf celle d'un produit récemment supprimé).
  // Déclenché par les changements de données uniquement, jamais par l'ajout d'une photo.
  useEffect(() => {
    if (!ready) return;
    const used = new Set<string>(pinnedRef.current);
    for (const p of data.products) if (p.imageId) used.add(p.imageId);
    if (data.shop.logoId) used.add(data.shop.logoId);
    if (lastDeleted?.product.imageId) used.add(lastDeleted.product.imageId);
    const unused = [...imagesRef.current.keys()].filter((id) => !used.has(id));
    if (unused.length === 0) return;
    setImages((prev) => {
      const next = new Map(prev);
      for (const id of unused) {
        const entry = next.get(id);
        if (entry) URL.revokeObjectURL(entry.thumbUrl);
        next.delete(id);
      }
      return next;
    });
    for (const id of unused) void deleteImage(id);
  }, [data.products, data.shop.logoId, lastDeleted, ready, gcTick]);

  const pinImage = useCallback((id: string) => {
    pinnedRef.current.add(id);
  }, []);

  const unpinImage = useCallback((id: string) => {
    pinnedRef.current.delete(id);
    setGcTick((t) => t + 1);
  }, []);

  const addImage = useCallback(async (image: StoredImage) => {
    setImages((prev) => {
      const next = new Map(prev);
      next.set(image.id, toEntry(image));
      return next;
    });
    if (prefsRef.current.autosave) {
      const ok = await putImage(image);
      if (!ok) setSaveStatus('error');
    }
  }, []);

  const loadData = useCallback(async (next: CatalogData, newImages: StoredImage[] = []) => {
    const map = new Map<string, ImageEntry>();
    for (const img of newImages) map.set(img.id, toEntry(img));
    setImages((prev) => {
      for (const entry of prev.values()) URL.revokeObjectURL(entry.thumbUrl);
      return map;
    });
    setLastDeleted(null);
    dispatch({ type: 'load', data: next });
    if (prefsRef.current.autosave) {
      await clearAllLocalData();
      saveCatalog(next);
      for (const img of newImages) await putImage(img);
    }
  }, []);

  const reset = useCallback(async () => {
    setImages((prev) => {
      for (const entry of prev.values()) URL.revokeObjectURL(entry.thumbUrl);
      return new Map();
    });
    setLastDeleted(null);
    dispatch({ type: 'reset' });
    await clearAllLocalData();
  }, []);

  const setAutosave = useCallback(
    async (enabled: boolean) => {
      const next = { ...prefsRef.current, autosave: enabled };
      setPrefs(next);
      savePrefs(next);
      if (!enabled) {
        await clearAllLocalData();
        setSaveStatus('disabled');
      } else {
        const result = saveCatalog(data);
        for (const entry of imagesRef.current.values()) {
          await putImage({
            id: entry.id,
            blob: entry.blob,
            thumb: entry.thumb,
            width: entry.width,
            height: entry.height,
          });
        }
        setSaveStatus(result === 'ok' ? 'saved' : 'error');
      }
    },
    [data],
  );

  const clearLocalData = useCallback(async () => {
    await clearAllLocalData();
    if (prefsRef.current.autosave) {
      // Les données affichées restent à l'écran mais ne sont plus enregistrées tant qu'elles ne changent pas.
      setSaveStatus('idle');
    }
  }, []);

  const deleteProduct = useCallback(
    (id: string) => {
      const index = data.products.findIndex((p) => p.id === id);
      if (index < 0) return;
      setLastDeleted({ product: data.products[index], index });
      dispatch({ type: 'delete', id });
    },
    [data.products],
  );

  const undoDelete = useCallback(() => {
    if (!lastDeleted) return;
    dispatch({ type: 'restore', product: lastDeleted.product, index: lastDeleted.index });
    setLastDeleted(null);
  }, [lastDeleted]);

  const value = useMemo<CreatorContextValue>(
    () => ({
      data,
      ready,
      images,
      prefs,
      saveStatus: prefs.autosave ? saveStatus : 'disabled',
      setShop: (patch) => dispatch({ type: 'shop', patch }),
      setSettings: (patch) => dispatch({ type: 'settings', patch }),
      addProducts: (products) => dispatch({ type: 'add', products }),
      updateProduct: (id, patch) => dispatch({ type: 'update', id, patch }),
      deleteProduct,
      undoDelete,
      clearUndo: () => setLastDeleted(null),
      lastDeleted,
      duplicateProduct: (id) => dispatch({ type: 'duplicate', id }),
      moveProduct: (id, delta) => dispatch({ type: 'move', id, delta }),
      addImage,
      pinImage,
      unpinImage,
      loadData,
      reset,
      setAutosave,
      clearLocalData,
    }),
    [
      data,
      ready,
      images,
      prefs,
      saveStatus,
      deleteProduct,
      undoDelete,
      lastDeleted,
      addImage,
      pinImage,
      unpinImage,
      loadData,
      reset,
      setAutosave,
      clearLocalData,
    ],
  );

  return <CreatorContext.Provider value={value}>{children}</CreatorContext.Provider>;
}

/** Nombre de produits complets (nom + prix) et incomplets. */
export function productStats(products: Product[]) {
  const complete = products.filter((p) => p.name.trim() && p.price != null).length;
  return { total: products.length, complete, incomplete: products.length - complete };
}
