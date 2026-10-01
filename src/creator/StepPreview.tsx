import { useState } from 'react';
import { PageList } from '../components/CatalogPreview';
import { ConfirmDialog } from '../components/Dialog';
import { Icon } from '../components/Icon';
import { catalogFileName } from '../core/text';
import { getTemplate } from '../pdf/layout';
import { useCreator } from './state';
import { usePreviewLayout } from './usePreviewLayout';

interface Props {
  goTo: (step: number) => void;
  onRestart: () => void;
}

export function StepPreview({ goTo, onRestart }: Props) {
  const { data, images } = useCreator();
  const preview = usePreviewLayout(data, images, true);
  const [confirm, setConfirm] = useState(false);
  const { layout } = preview;
  const template = getTemplate(data.settings.templateId);
  const fileName = catalogFileName(data.shop.name);

  return (
    <div className="step-body">
      <div className="step-intro">
        <h2>Aperçu de votre catalogue</h2>
        <p>Vérifiez chaque page. Ce que vous voyez ici est exactement ce que contiendra le PDF.</p>
      </div>

      <dl className="summary-grid">
        <div>
          <dt>Produits</dt>
          <dd>{layout.productCount}</dd>
        </div>
        <div>
          <dt>Pages</dt>
          <dd>{layout.pages.length}</dd>
        </div>
        <div>
          <dt>Modèle</dt>
          <dd>{template.name}</dd>
        </div>
        <div>
          <dt>Format</dt>
          <dd>{data.settings.orientation === 'portrait' ? 'A4 portrait' : 'A4 paysage'}</dd>
        </div>
        <div className="summary-wide">
          <dt>Nom du fichier</dt>
          <dd className="file-name">{fileName}</dd>
        </div>
      </dl>

      {preview.incompleteCount > 0 && (
        <p className="notice notice-warning">
          <Icon name="alert" />
          <span>
            {preview.incompleteCount} produit{preview.incompleteCount > 1 ? 's' : ''} sans nom ou sans prix{' '}
            {preview.incompleteCount > 1 ? 'ne sont' : 'n’est'} pas dans le catalogue.{' '}
            <button type="button" className="link-btn" onClick={() => goTo(2)}>
              Compléter
            </button>
          </span>
        </p>
      )}
      {preview.overLimitCount > 0 && (
        <p className="notice">
          <Icon name="info" />
          <span>
            L’export gratuit contient les {layout.productCount} premiers produits ({preview.overLimitCount} non inclus).
          </span>
        </p>
      )}
      {preview.removedCharacters && (
        <p className="notice notice-warning">
          <Icon name="info" />
          <span>
            Certains caractères spéciaux (émojis, symboles rares) ne peuvent pas être imprimés dans le PDF et ont été
            retirés de l’aperçu.
          </span>
        </p>
      )}

      <div className="edit-shortcuts" role="group" aria-label="Modifier le catalogue">
        <button type="button" className="btn btn-sm" onClick={() => goTo(1)}>
          <Icon name="store" /> Modifier la boutique
        </button>
        <button type="button" className="btn btn-sm" onClick={() => goTo(2)}>
          <Icon name="box" /> Modifier les produits
        </button>
        <button type="button" className="btn btn-sm" onClick={() => goTo(3)}>
          <Icon name="palette" /> Changer de modèle
        </button>
        <button type="button" className="btn btn-sm btn-danger" onClick={() => setConfirm(true)}>
          <Icon name="refresh" /> Recommencer
        </button>
      </div>

      <p className="small-note">
        <Icon name="info" size={18} /> La mention « version démo » en filigrane correspond à l’export gratuit.
      </p>

      <PageList
        layout={layout}
        resolveImage={preview.resolveImage}
        idPrefix="preview"
        shopName={data.shop.name}
        className="preview-pages"
      />

      <ConfirmDialog
        open={confirm}
        title="Recommencer à zéro ?"
        message={
          <>
            <p>
              Toutes les informations de la boutique, les produits et les photos seront <strong>définitivement
              effacés</strong> de cet appareil.
            </p>
            <p>Pensez à télécharger votre PDF avant si vous en avez besoin.</p>
          </>
        }
        confirmLabel="Oui, tout effacer"
        danger
        onConfirm={() => {
          setConfirm(false);
          onRestart();
        }}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}
