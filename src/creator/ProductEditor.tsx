import { useId, useMemo, useRef, useState } from 'react';
import { Dialog } from '../components/Dialog';
import { Icon } from '../components/Icon';
import { AVAILABILITY_LABELS, createEmptyProduct, createId, LIMITS } from '../core/defaults';
import { currencySymbol, formatNumber, parsePrice } from '../core/price';
import type { Availability, Product } from '../core/types';
import { SelectField, TextAreaField, TextField } from './fields';
import { ACCEPT_ATTRIBUTE, ImageImportError, processImage, PRODUCT_IMAGE } from './imageProcessing';
import { useCreator } from './state';

interface Props {
  open: boolean;
  /** Produit à modifier, ou null pour un nouveau produit. */
  product: Product | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

interface Draft {
  name: string;
  price: string;
  oldPrice: string;
  description: string;
  category: string;
  reference: string;
  availability: Availability;
  imageId: string | null;
}

const toText = (v: number | null) => (v == null ? '' : formatNumber(v).replace(/\u00A0/g, ' '));

function toDraft(p: Product): Draft {
  return {
    name: p.name,
    price: toText(p.price),
    oldPrice: toText(p.oldPrice),
    description: p.description,
    category: p.category,
    reference: p.reference,
    availability: p.availability,
    imageId: p.imageId,
  };
}

export function ProductEditor({ open, product, onClose, onSaved }: Props) {
  const { data, images, addImage, addProducts, updateProduct, pinImage, unpinImage } = useCreator();
  const [draft, setDraft] = useState<Draft>(() => toDraft(product ?? createEmptyProduct()));
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const pinned = useRef<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  // Le brouillon est réinitialisé à chaque ouverture : le parent recrée ce composant (clé « key »).

  const releasePins = () => {
    for (const id of pinned.current) unpinImage(id);
    pinned.current = [];
  };

  const close = () => {
    releasePins();
    onClose();
  };

  const categories = useMemo(
    () =>
      [...new Set(data.products.map((p) => p.category.trim()).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, 'fr'),
      ),
    [data.products],
  );

  const price = parsePrice(draft.price);
  const oldPrice = draft.oldPrice.trim() ? parsePrice(draft.oldPrice) : null;
  const symbol = currencySymbol(data.shop.currency);

  const errors = {
    name: !draft.name.trim() ? 'Le nom du produit est obligatoire.' : null,
    price: !draft.price.trim()
      ? 'Le prix est obligatoire.'
      : price == null
        ? 'Prix invalide. Écrivez seulement le nombre, par exemple 12,50 ou 25000.'
        : null,
    oldPrice:
      draft.oldPrice.trim() && oldPrice == null
        ? 'Ancien prix invalide. Exemple : 15 ou 15,90.'
        : null,
  };
  const oldPriceWarning =
    oldPrice != null && price != null && oldPrice <= price
      ? 'L’ancien prix doit être plus élevé que le prix actuel pour afficher une promotion.'
      : null;

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    setPhotoError(null);
    setBusy(true);
    try {
      const processed = await processImage(file, PRODUCT_IMAGE);
      const id = createId('img');
      pinImage(id);
      pinned.current.push(id);
      await addImage({ id, ...processed });
      setDraft((d) => ({ ...d, imageId: id }));
    } catch (e) {
      setPhotoError(
        e instanceof ImageImportError
          ? e.message
          : 'Impossible d’utiliser cette photo. Essayez une autre photo.',
      );
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const save = (addAnother: boolean) => {
    setSubmitted(true);
    if (errors.name || errors.price || errors.oldPrice) {
      const first = errors.name
        ? 'product-name'
        : errors.price
          ? 'product-price'
          : 'product-old-price';
      document.getElementById(first)?.focus();
      return;
    }
    const patch: Omit<Product, 'id'> = {
      name: draft.name.trim(),
      price,
      oldPrice,
      description: draft.description.trim(),
      category: draft.category.trim(),
      reference: draft.reference.trim(),
      availability: draft.availability,
      imageId: draft.imageId,
    };
    if (product && data.products.some((p) => p.id === product.id)) {
      updateProduct(product.id, patch);
      onSaved(`« ${patch.name} » a été modifié.`);
    } else {
      addProducts([{ id: createId('p'), ...patch }]);
      onSaved(`« ${patch.name} » a été ajouté au catalogue.`);
    }
    releasePins();
    if (addAnother) {
      setDraft(toDraft({ ...createEmptyProduct(), category: patch.category }));
      setSubmitted(false);
      requestAnimationFrame(() => nameRef.current?.focus());
    } else {
      onClose();
    }
  };

  const image = draft.imageId ? images.get(draft.imageId) : undefined;
  const isNew = !product || !data.products.some((p) => p.id === product.id);
  const atLimit = isNew && data.products.length >= LIMITS.maxProductsInEditor;

  return (
    <Dialog
      open={open}
      onClose={close}
      title={isNew ? 'Ajouter un produit' : 'Modifier le produit'}
      size="large"
      busy={busy}
      footer={
        <>
          <button type="button" className="btn" onClick={close} disabled={busy}>
            Annuler
          </button>
          {isNew && (
            <button
              type="button"
              className="btn"
              onClick={() => save(true)}
              disabled={busy || atLimit}
            >
              Enregistrer et ajouter un autre
            </button>
          )}
          <button
            type="button"
            className="btn btn-dark"
            onClick={() => save(false)}
            disabled={busy || atLimit}
          >
            <Icon name="check" /> Enregistrer
          </button>
        </>
      }
    >
      <form
        className="product-form"
        onSubmit={(e) => {
          e.preventDefault();
          save(false);
        }}
        noValidate
      >
        <div className="photo-field">
          <div className={`photo-preview${image ? ' has-image' : ''}`}>
            {image ? (
              <img
                src={image.thumbUrl}
                alt={draft.name ? `Produit : ${draft.name}` : 'Produit sans nom'}
              />
            ) : (
              <div className="photo-empty">
                <Icon name="camera" size={34} />
                <span>Photo recommandée</span>
              </div>
            )}
            {busy && (
              <div className="photo-busy" role="status">
                <span className="spinner" aria-hidden="true" /> Optimisation de la photo…
              </div>
            )}
          </div>
          <div className="photo-actions">
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPT_ATTRIBUTE}
              className="visually-hidden"
              id="product-photo-input"
              aria-label="Choisir une photo du produit"
              onChange={(e) => onPhoto(e.target.files?.[0])}
            />
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
            >
              <Icon name={image ? 'refresh' : 'camera'} />{' '}
              {image ? 'Changer la photo' : 'Ajouter une photo'}
            </button>
            {image && (
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => setDraft((d) => ({ ...d, imageId: null }))}
                disabled={busy}
              >
                <Icon name="trash" /> Retirer
              </button>
            )}
            <p className="field-hint">
              JPEG, PNG ou WebP. Les photos lourdes sont réduites automatiquement.
            </p>
            {photoError && (
              <p className="field-error" role="alert">
                <Icon name="alert" size={16} /> {photoError}
              </p>
            )}
          </div>
        </div>

        <div className="form-grid">
          <TextField
            ref={nameRef}
            id="product-name"
            label="Nom du produit"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            maxLength={LIMITS.nameMaxLength}
            placeholder="Ex. : Robe wax longue"
            error={submitted ? errors.name : null}
            autoComplete="off"
          />
          <div className="form-row-2">
            <TextField
              id="product-price"
              label={`Prix${symbol ? ` (${symbol})` : ''}`}
              value={draft.price}
              onChange={(e) => setDraft({ ...draft, price: e.target.value })}
              inputMode="decimal"
              placeholder="Ex. : 25 ou 12,50"
              error={submitted ? errors.price : null}
              autoComplete="off"
            />
            <TextField
              id="product-old-price"
              label="Ancien prix"
              optional
              value={draft.oldPrice}
              onChange={(e) => setDraft({ ...draft, oldPrice: e.target.value })}
              inputMode="decimal"
              placeholder="Prix barré"
              error={errors.oldPrice}
              warning={oldPriceWarning}
              autoComplete="off"
            />
          </div>
          <TextAreaField
            label="Description courte"
            optional
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            maxLength={LIMITS.descriptionMaxLength}
            rows={3}
            placeholder="Matière, taille, contenance, goût…"
            counter={{ value: draft.description.length, max: LIMITS.descriptionMaxLength }}
            hint="Les textes trop longs pour la fiche se terminent par « … » dans le PDF."
          />
          <div className="form-row-2">
            <TextField
              label="Catégorie"
              optional
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              maxLength={LIMITS.categoryMaxLength}
              placeholder="Ex. : Robes, Boissons"
              list={listId}
              autoComplete="off"
            />
            <TextField
              label="Référence"
              optional
              value={draft.reference}
              onChange={(e) => setDraft({ ...draft, reference: e.target.value })}
              maxLength={LIMITS.referenceMaxLength}
              placeholder="Ex. : RB-01"
              autoComplete="off"
            />
          </div>
          <datalist id={listId}>
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <SelectField
            label="Disponibilité"
            optional
            value={draft.availability}
            onChange={(e) => setDraft({ ...draft, availability: e.target.value as Availability })}
          >
            {(Object.keys(AVAILABILITY_LABELS) as Availability[]).map((a) => (
              <option key={a} value={a}>
                {a === '' ? 'Ne pas afficher' : AVAILABILITY_LABELS[a]}
              </option>
            ))}
          </SelectField>
        </div>
        {atLimit && (
          <p className="notice notice-warning">
            <Icon name="alert" /> Vous avez atteint le maximum de {LIMITS.maxProductsInEditor}{' '}
            produits.
          </p>
        )}
        <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
      </form>
    </Dialog>
  );
}
