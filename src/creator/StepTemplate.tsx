import { useMemo } from 'react';
import { PageList } from '../components/CatalogPreview';
import { Icon } from '../components/Icon';
import { LIMITS } from '../core/defaults';
import type { Density, ImageFit, Orientation, TemplateId } from '../core/types';
import { layoutCatalog, productsPerPage, TEMPLATES } from '../pdf/layout';
import { SvgPage } from '../pdf/preview/SvgPage';
import { ColorPicker } from './ColorPicker';
import { TextField, Toggle } from './fields';
import { useCreator } from './state';
import { usePreviewLayout } from './usePreviewLayout';

const DENSITY_LABELS: Record<Density, string> = { large: 'Grands', medium: 'Moyens', small: 'Petits' };

export function StepTemplate() {
  const { data, images, setSettings, setShop } = useCreator();
  const s = data.settings;
  const preview = usePreviewLayout(data, images, false);
  const resolveImage = preview.resolveImage;

  // Couverture du catalogue de l'utilisateur dans chacun des modèles.
  const covers = useMemo(
    () =>
      TEMPLATES.map((t) => {
        const result = layoutCatalog(
          { ...data, settings: { ...s, templateId: t.id, orientation: 'portrait' } },
          { availableImages: new Set(images.keys()), watermark: null, maxProducts: 12 },
        );
        return { template: t, layout: result.layout };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.shop, data.products, s.coverTitle, s.showContact, s.imageFit, s.whatsappLinks, images],
  );

  const current = TEMPLATES.find((t) => t.id === s.templateId) ?? TEMPLATES[0];

  return (
    <div className="step-body">
      <div className="step-intro">
        <h2>Choisissez un modèle</h2>
        <p>Chaque modèle a sa propre mise en page. Vous pouvez en changer à tout moment : vos produits sont conservés.</p>
      </div>

      <div className="template-choices" role="radiogroup" aria-label="Modèles de catalogue">
        {covers.map(({ template, layout }) => {
          const selected = template.id === s.templateId;
          return (
            <button
              key={template.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`template-choice${selected ? ' is-selected' : ''}`}
              onClick={() => setSettings({ templateId: template.id as TemplateId })}
            >
              <span className="template-thumb">
                <SvgPage
                  className="pdf-page"
                  page={layout.pages[0]}
                  width={layout.width}
                  height={layout.height}
                  resolveImage={resolveImage}
                  idPrefix={`choice-${template.id}`}
                  label={`Couverture avec le modèle ${template.name}`}
                />
              </span>
              <span className="template-choice-text">
                <strong>{template.name}</strong>
                <span>{template.tagline}</span>
              </span>
              {selected && (
                <span className="template-check" aria-hidden="true">
                  <Icon name="check" size={18} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="template-settings">
        <div className="settings-panel">
          <fieldset className="form-section">
            <legend>Format</legend>
            <div className="segmented" role="radiogroup" aria-label="Orientation de la page">
              {(['portrait', 'landscape'] as Orientation[]).map((o) => (
                <label key={o} className={`segment${s.orientation === o ? ' is-active' : ''}`}>
                  <input
                    type="radio"
                    name="orientation"
                    value={o}
                    checked={s.orientation === o}
                    onChange={() => setSettings({ orientation: o })}
                  />
                  <span className={`page-icon ${o}`} aria-hidden="true" />
                  {o === 'portrait' ? 'A4 portrait' : 'A4 paysage'}
                </label>
              ))}
            </div>
            <p className="field-label mt">Taille des produits</p>
            <div className="segmented" role="radiogroup" aria-label="Taille des produits">
              {(['large', 'medium', 'small'] as Density[]).map((d) => (
                <label key={d} className={`segment${s.density === d ? ' is-active' : ''}`}>
                  <input
                    type="radio"
                    name="density"
                    value={d}
                    checked={s.density === d}
                    onChange={() => setSettings({ density: d })}
                  />
                  {DENSITY_LABELS[d]}
                  <small>{productsPerPage(s.templateId, s.orientation, d)} par page</small>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>Couleur et couverture</legend>
            <ColorPicker
              value={data.shop.primaryColor}
              onChange={(primaryColor) => setShop({ primaryColor })}
              recommended={{ hex: current.recommendedColor, label: `Couleur conseillée pour « ${current.name} »` }}
            />
            <TextField
              label="Titre de la couverture"
              value={s.coverTitle}
              onChange={(e) => setSettings({ coverTitle: e.target.value })}
              maxLength={LIMITS.coverTitleMaxLength}
              placeholder="Catalogue"
              hint="Ex. : Catalogue, Menu, Nouvelle collection, Liste de prix."
            />
          </fieldset>

          <fieldset className="form-section">
            <legend>Afficher dans le catalogue</legend>
            <Toggle
              checked={s.showDescription}
              onChange={(v) => setSettings({ showDescription: v })}
              label="Descriptions des produits"
            />
            <Toggle
              checked={s.showOldPrice}
              onChange={(v) => setSettings({ showOldPrice: v })}
              label="Anciens prix barrés (promotions)"
            />
            <Toggle
              checked={s.showDetails}
              onChange={(v) => setSettings({ showDetails: v })}
              label="Référence et disponibilité"
            />
            <Toggle
              checked={s.showContact}
              onChange={(v) => setSettings({ showContact: v })}
              label="Coordonnées de la boutique"
              description="Sur la couverture et en bas de chaque page."
            />
            <Toggle
              checked={s.groupByCategory}
              onChange={(v) => setSettings({ groupByCategory: v })}
              label="Regrouper par catégorie"
              description="Ajoute un titre avant chaque catégorie (idéal pour un menu)."
            />
            <Toggle
              checked={s.whatsappLinks}
              onChange={(v) => setSettings({ whatsappLinks: v })}
              label="Liens WhatsApp cliquables"
              description="Vos clients vous écrivent en touchant un produit dans le PDF."
            />
          </fieldset>

          <fieldset className="form-section">
            <legend>Cadrage des photos</legend>
            <div className="segmented" role="radiogroup" aria-label="Cadrage des photos">
              {(
                [
                  ['cover', 'Remplir le cadre', 'Photo recadrée au centre'],
                  ['contain', 'Photo entière', 'Aucune partie coupée'],
                ] as [ImageFit, string, string][]
              ).map(([fit, label, help]) => (
                <label key={fit} className={`segment${s.imageFit === fit ? ' is-active' : ''}`}>
                  <input
                    type="radio"
                    name="fit"
                    value={fit}
                    checked={s.imageFit === fit}
                    onChange={() => setSettings({ imageFit: fit })}
                  />
                  {label}
                  <small>{help}</small>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <aside className="live-preview" aria-label="Aperçu en direct">
          <p className="live-title">
            <Icon name="eye" size={18} /> Aperçu en direct
          </p>
          {preview.layout.productCount > 0 ? (
            <PageList
              layout={preview.layout}
              resolveImage={resolveImage}
              idPrefix="live"
              pages={[0, 1]}
              shopName={data.shop.name}
              className="live-pages"
            />
          ) : (
            <p className="field-hint">L’aperçu apparaîtra dès qu’un produit complet (nom et prix) sera ajouté.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
