import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../components/Icon';
import { getEntitlements } from '../config/plans';
import { createEmptyProduct, createId, LIMITS } from '../core/defaults';
import { formatPrice } from '../core/price';
import type { Product, SortMode } from '../core/types';
import { sortProducts } from '../pdf/prepare';
import { ACCEPT_ATTRIBUTE, ImageImportError, processImage, PRODUCT_IMAGE } from './imageProcessing';
import { ProductEditor } from './ProductEditor';
import { productStats, useCreator } from './state';

interface Props {
  onOpenDemo: () => void;
  announce: (message: string) => void;
  showErrors: boolean;
}

const SORT_LABELS: Record<SortMode, string> = {
  manual: 'Ordre manuel',
  name: 'Nom (A → Z)',
  'price-asc': 'Prix croissant',
  'price-desc': 'Prix décroissant',
};

export function StepProducts({ onOpenDemo, announce, showErrors }: Props) {
  const {
    data,
    images,
    addImage,
    addProducts,
    deleteProduct,
    duplicateProduct,
    moveProduct,
    setSettings,
    lastDeleted,
    undoDelete,
    clearUndo,
  } = useCreator();
  const [editing, setEditing] = useState<Product | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  const [bulk, setBulk] = useState<{ done: number; total: number } | null>(null);
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);
  const bulkRef = useRef<HTMLInputElement>(null);

  const stats = productStats(data.products);
  const rights = getEntitlements();
  const sort = data.settings.sort;
  const currency = data.shop.currency;

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of data.products) {
      const c = p.category.trim();
      if (c) counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0], 'fr'));
  }, [data.products]);

  // Si la catégorie filtrée disparaît, on revient à « Toutes ».
  useEffect(() => {
    if (filter && !categories.some(([c]) => c === filter)) setFilter(null);
  }, [categories, filter]);

  // L'annulation de suppression reste proposée quelques secondes.
  useEffect(() => {
    if (!lastDeleted) return;
    const t = window.setTimeout(clearUndo, 8000);
    return () => window.clearTimeout(t);
  }, [lastDeleted, clearUndo]);

  const visible = useMemo(() => {
    const sorted = sortProducts(data.products, sort);
    return filter ? sorted.filter((p) => p.category.trim() === filter) : sorted;
  }, [data.products, sort, filter]);

  const openNew = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setEditorOpen(true);
  };

  const onBulk = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const room = LIMITS.maxProductsInEditor - data.products.length;
    const list = [...files].slice(0, Math.max(0, room));
    const errors: string[] = [];
    if (files.length > list.length) errors.push(`Limite de ${LIMITS.maxProductsInEditor} produits atteinte : ${files.length - list.length} photo(s) ignorée(s).`);
    setBulk({ done: 0, total: list.length });
    setBulkErrors([]);
    const created: Product[] = [];
    for (let i = 0; i < list.length; i++) {
      try {
        const processed = await processImage(list[i], PRODUCT_IMAGE);
        const id = createId('img');
        await addImage({ id, ...processed });
        created.push({ ...createEmptyProduct(), imageId: id });
      } catch (e) {
        errors.push(e instanceof ImageImportError ? e.message : `« ${list[i].name} » n’a pas pu être importée.`);
      }
      setBulk({ done: i + 1, total: list.length });
    }
    if (created.length) addProducts(created);
    setBulk(null);
    setBulkErrors(errors);
    if (bulkRef.current) bulkRef.current.value = '';
    announce(
      created.length
        ? `${created.length} photo(s) ajoutée(s). Complétez maintenant le nom et le prix de chaque produit.`
        : 'Aucune photo n’a pu être ajoutée.',
    );
  };

  const remove = (p: Product) => {
    deleteProduct(p.id);
    announce(`« ${p.name || 'Produit sans nom'} » supprimé.`);
  };

  const duplicate = (p: Product) => {
    duplicateProduct(p.id);
    announce(`« ${p.name || 'Produit sans nom'} » dupliqué.`);
  };

  const move = (p: Product, delta: -1 | 1) => {
    moveProduct(p.id, delta);
    announce(delta < 0 ? 'Produit déplacé vers le haut.' : 'Produit déplacé vers le bas.');
    // Garde le focus sur le même bouton après le déplacement.
    requestAnimationFrame(() => document.getElementById(`move-${delta < 0 ? 'up' : 'down'}-${p.id}`)?.focus());
  };

  const atLimit = data.products.length >= LIMITS.maxProductsInEditor;
  const noComplete = showErrors && stats.complete === 0;

  return (
    <div className="step-body">
      <div className="step-intro">
        <h2>Vos produits</h2>
        <p>
          Ajoutez chaque produit avec sa photo, son nom et son prix. Astuce : ajoutez plusieurs photos d’un coup, puis
          complétez les prix.
        </p>
      </div>

      <div className="product-actions">
        <button type="button" className="btn btn-primary" onClick={openNew} disabled={atLimit || !!bulk}>
          <Icon name="plus" /> Ajouter un produit
        </button>
        <input
          ref={bulkRef}
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          multiple
          className="visually-hidden"
          id="bulk-input"
          aria-label="Choisir plusieurs photos de produits"
          onChange={(e) => onBulk(e.target.files)}
        />
        <button type="button" className="btn" onClick={() => bulkRef.current?.click()} disabled={atLimit || !!bulk}>
          <Icon name="images" /> Ajouter plusieurs photos
        </button>
        <button type="button" className="btn btn-ghost" onClick={onOpenDemo} disabled={!!bulk}>
          <Icon name="sparkles" /> Charger une boutique exemple
        </button>
      </div>

      {bulk && (
        <div className="notice" role="status">
          <span className="spinner" aria-hidden="true" />
          <div className="grow">
            <p>
              Optimisation des photos : {bulk.done} sur {bulk.total}…
            </p>
            <div className="progress" aria-hidden="true">
              <div className="progress-bar" style={{ width: `${(bulk.done / Math.max(1, bulk.total)) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {bulkErrors.length > 0 && (
        <div className="notice notice-danger" role="alert">
          <Icon name="alert" />
          <div>
            <p>
              <strong>Certaines photos n’ont pas été ajoutées :</strong>
            </p>
            <ul className="error-list">
              {bulkErrors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setBulkErrors([])}>
              Fermer ce message
            </button>
          </div>
        </div>
      )}

      {noComplete && (
        <div className="notice notice-danger" role="alert" id="products-error">
          <Icon name="alert" />
          <p>
            {data.products.length === 0
              ? 'Ajoutez au moins un produit pour continuer.'
              : 'Complétez au moins un produit (nom et prix) pour continuer.'}
          </p>
        </div>
      )}

      {data.products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Icon name="box" size={36} />
          </div>
          <h3>Aucun produit pour l’instant</h3>
          <p>Commencez par un premier produit, ou chargez une boutique exemple pour découvrir l’outil.</p>
        </div>
      ) : (
        <>
          <div className="list-summary">
            <p className="count" aria-live="polite">
              <strong>
                {stats.total} produit{stats.total > 1 ? 's' : ''}
              </strong>
              {stats.incomplete > 0 && (
                <span className="badge badge-warning">
                  {stats.incomplete} à compléter
                </span>
              )}
            </p>
            <label className="sort-control">
              <Icon name="sort" size={18} />
              <span className="visually-hidden">Ordre des produits dans le catalogue</span>
              <select
                className="select select-sm"
                value={sort}
                onChange={(e) => setSettings({ sort: e.target.value as SortMode })}
              >
                {(Object.keys(SORT_LABELS) as SortMode[]).map((s) => (
                  <option key={s} value={s}>
                    {SORT_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {stats.incomplete > 0 && (
            <p className="notice notice-warning">
              <Icon name="alert" />
              <span>
                Les produits sans nom ou sans prix ne seront pas dans le catalogue. Touchez « Compléter » pour les
                terminer.
              </span>
            </p>
          )}

          {stats.complete > rights.maxProductsPerExport && (
            <p className="notice">
              <Icon name="info" />
              <span>
                L’export gratuit contient les {rights.maxProductsPerExport} premiers produits. Les suivants restent
                enregistrés dans l’outil.
              </span>
            </p>
          )}

          {categories.length > 1 && (
            <div className="chips" role="group" aria-label="Filtrer par catégorie">
              <button type="button" className="chip" aria-pressed={filter === null} onClick={() => setFilter(null)}>
                Toutes ({data.products.length})
              </button>
              {categories.map(([c, n]) => (
                <button key={c} type="button" className="chip" aria-pressed={filter === c} onClick={() => setFilter(c)}>
                  {c} ({n})
                </button>
              ))}
            </div>
          )}

          {sort !== 'manual' && (
            <p className="field-hint">Tri automatique actif : choisissez « Ordre manuel » pour déplacer les produits.</p>
          )}

          <ol className="product-list">
            {visible.map((p) => {
              const index = data.products.findIndex((x) => x.id === p.id);
              const thumb = p.imageId ? images.get(p.imageId)?.thumbUrl : undefined;
              const incomplete = !p.name.trim() || p.price == null;
              return (
                <li key={p.id} className={`product-row${incomplete ? ' is-incomplete' : ''}`}>
                  <button type="button" className="product-main" onClick={() => openEdit(p)}>
                    <span className="product-thumb">
                      {thumb ? <img src={thumb} alt="" loading="lazy" decoding="async" /> : <Icon name="image" />}
                    </span>
                    <span className="product-info">
                      <span className="product-name">{p.name.trim() || <em>Produit sans nom</em>}</span>
                      <span className="product-meta">
                        {p.price != null ? (
                          <span className="product-price">{formatPrice(p.price, currency)}</span>
                        ) : (
                          <span className="missing">Prix manquant</span>
                        )}
                        {p.category.trim() && <span className="product-cat">{p.category}</span>}
                        {!p.imageId && <span className="product-nophoto">Sans photo</span>}
                      </span>
                    </span>
                    <span className="product-edit-hint">
                      {incomplete ? <span className="badge badge-warning">Compléter</span> : <Icon name="edit" size={18} />}
                      <span className="visually-hidden">Modifier {p.name || 'ce produit'}</span>
                    </span>
                  </button>
                  <div className="product-tools" role="group" aria-label={`Actions pour ${p.name || 'ce produit'}`}>
                    <button
                      type="button"
                      className="icon-btn"
                      id={`move-up-${p.id}`}
                      onClick={() => move(p, -1)}
                      disabled={sort !== 'manual' || !!filter || index === 0}
                      title="Monter"
                    >
                      <Icon name="chevronUp" />
                      <span className="visually-hidden">Monter {p.name}</span>
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      id={`move-down-${p.id}`}
                      onClick={() => move(p, 1)}
                      disabled={sort !== 'manual' || !!filter || index === data.products.length - 1}
                      title="Descendre"
                    >
                      <Icon name="chevronDown" />
                      <span className="visually-hidden">Descendre {p.name}</span>
                    </button>
                    <button type="button" className="icon-btn" onClick={() => duplicate(p)} disabled={atLimit} title="Dupliquer">
                      <Icon name="copy" />
                      <span className="visually-hidden">Dupliquer {p.name}</span>
                    </button>
                    <button type="button" className="icon-btn icon-btn-danger" onClick={() => remove(p)} title="Supprimer">
                      <Icon name="trash" />
                      <span className="visually-hidden">Supprimer {p.name}</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      )}

      {lastDeleted && (
        <div className="snackbar" role="status">
          <span>Produit supprimé.</span>
          <button type="button" className="btn btn-sm" onClick={undoDelete}>
            Annuler
          </button>
        </div>
      )}

      <ProductEditor
        open={editorOpen}
        product={editing}
        onClose={() => setEditorOpen(false)}
        onSaved={announce}
      />
    </div>
  );
}
