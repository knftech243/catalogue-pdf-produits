import { useEffect, useRef, useState } from 'react';
import { Dialog } from '../components/Dialog';
import { Icon } from '../components/Icon';
import { getEntitlements, PREMIUM_FEATURES } from '../config/plans';
import { SITE } from '../config/site';
import { formatBytes } from '../core/text';
import { getTemplate } from '../pdf/layout';
import type { ExportProgress, ExportResult } from '../pdf/export';
import { Link } from '../router/router';
import { useCreator } from './state';
import { usePreviewLayout } from './usePreviewLayout';

type Status = 'idle' | 'working' | 'done' | 'error';

export function StepExport() {
  const { data, images } = useCreator();
  const preview = usePreviewLayout(data, images, true);
  const rights = getEntitlements();
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Le PDF précédent devient obsolète dès que le catalogue change.
  useEffect(() => {
    setStatus((s) => (s === 'done' ? 'idle' : s));
  }, [data]);

  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );

  const generate = async () => {
    setStatus('working');
    setError(null);
    setShareError(null);
    setProgress({ phase: 'layout', percent: 0, message: 'Préparation…' });
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const { generateCatalogPdf } = await import('../pdf/export');
      const res = await generateCatalogPdf({
        data,
        getImageBlob: (id) => images.get(id)?.blob,
        onProgress: setProgress,
        signal: controller.signal,
      });
      setResult(res);
      setUrl(URL.createObjectURL(res.blob));
      setStatus('done');
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        setStatus('idle');
        return;
      }
      const message =
        e instanceof Error && e.message.startsWith('Ajoutez')
          ? e.message
          : 'La création du PDF a échoué. Fermez les autres applications, puis réessayez. Si le problème continue, essayez avec moins de produits ou depuis un ordinateur.';
      setError(message);
      setStatus('error');
    } finally {
      abortRef.current = null;
    }
  };

  const canShare =
    typeof navigator !== 'undefined' &&
    !!result &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [new File([result.blob], result.fileName, { type: 'application/pdf' })] });

  const share = async () => {
    if (!result) return;
    setShareError(null);
    try {
      await navigator.share({
        files: [new File([result.blob], result.fileName, { type: 'application/pdf' })],
        title: `Catalogue ${data.shop.name}`,
      });
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setShareError('Le partage direct n’a pas fonctionné. Téléchargez le PDF, puis envoyez-le depuis WhatsApp.');
    }
  };

  const template = getTemplate(data.settings.templateId);
  const { layout } = preview;

  return (
    <div className="step-body">
      <div className="step-intro">
        <h2>Télécharger votre catalogue</h2>
        <p>Le PDF est fabriqué sur votre appareil, en quelques secondes. Rien n’est envoyé sur Internet.</p>
      </div>

      <div className="export-grid">
        <section className="card export-card" aria-labelledby="export-title">
          <h3 id="export-title">Export de démonstration gratuit</h3>
          <ul className="check-list">
            <li>
              <Icon name="check" /> {layout.productCount} produit{layout.productCount > 1 ? 's' : ''} ·{' '}
              {layout.pages.length} page{layout.pages.length > 1 ? 's' : ''} · {template.name}
            </li>
            <li>
              <Icon name="check" /> Format A4 {data.settings.orientation === 'portrait' ? 'portrait' : 'paysage'}, texte net
            </li>
            <li>
              <Icon name="check" /> Mention « version démo » discrète en filigrane
            </li>
            <li>
              <Icon name="check" /> Jusqu’à {rights.maxProductsPerExport} produits par export
            </li>
          </ul>

          {preview.overLimitCount > 0 && (
            <p className="notice">
              <Icon name="info" />
              <span>
                {preview.overLimitCount} produit{preview.overLimitCount > 1 ? 's' : ''} au-delà de{' '}
                {rights.maxProductsPerExport} ne {preview.overLimitCount > 1 ? 'seront' : 'sera'} pas inclus.
              </span>
            </p>
          )}

          {status !== 'working' && (
            <button
              type="button"
              className="btn btn-primary btn-lg btn-block"
              onClick={generate}
              disabled={layout.productCount === 0}
            >
              <Icon name="file" /> {status === 'done' ? 'Créer à nouveau le PDF' : 'Créer mon PDF'}
            </button>
          )}
          {layout.productCount === 0 && (
            <p className="field-error">Ajoutez au moins un produit avec un nom et un prix.</p>
          )}

          {status === 'working' && progress && (
            <div className="export-progress" role="status" aria-live="polite">
              <div className="progress-head">
                <span className="spinner" aria-hidden="true" />
                <span>{progress.message}</span>
                <strong>{progress.percent} %</strong>
              </div>
              <div
                className="progress"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress.percent}
                aria-label="Progression de la création du PDF"
              >
                <div className="progress-bar" style={{ width: `${progress.percent}%` }} />
              </div>
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => abortRef.current?.abort()}>
                Annuler
              </button>
            </div>
          )}

          {status === 'error' && error && (
            <div className="notice notice-danger" role="alert">
              <Icon name="alert" />
              <p>{error}</p>
            </div>
          )}

          {status === 'done' && result && url && (
            <div className="export-success" ref={resultRef} tabIndex={-1}>
              <div className="notice notice-success" role="status">
                <Icon name="checkCircle" />
                <div>
                  <p>
                    <strong>Votre catalogue est prêt !</strong>
                  </p>
                  <p className="file-name">
                    {result.fileName} · {result.pageCount} pages · {formatBytes(result.blob.size)}
                  </p>
                </div>
              </div>
              <a className="btn btn-dark btn-lg btn-block" href={url} download={result.fileName}>
                <Icon name="download" /> Télécharger le PDF
              </a>
              {canShare && (
                <button type="button" className="btn btn-lg btn-block" onClick={share}>
                  <Icon name="share" /> Partager le PDF (WhatsApp, e-mail…)
                </button>
              )}
              {shareError && <p className="field-error">{shareError}</p>}
              {result.removedCharacters && (
                <p className="field-hint">
                  Certains caractères spéciaux (émojis…) ont été retirés car ils ne peuvent pas être imprimés dans le PDF.
                </p>
              )}
            </div>
          )}
        </section>

        <section className="card howto-card" aria-labelledby="howto-title">
          <h3 id="howto-title">Envoyer le PDF sur WhatsApp</h3>
          <ol className="howto">
            <li>Touchez « Télécharger le PDF ». Le fichier va dans vos téléchargements.</li>
            <li>Ouvrez WhatsApp et la discussion (ou le groupe) de votre choix.</li>
            <li>Touchez le trombone 📎, puis « Document ».</li>
            <li>Choisissez le fichier « {result?.fileName ?? 'catalogue-….pdf'} » et envoyez.</li>
          </ol>
          <p className="field-hint">
            Vous pouvez aussi l’envoyer par e-mail, le publier sur Facebook ou l’imprimer.
          </p>
        </section>
      </div>

      <section className="premium-card" aria-labelledby="premium-title">
        <div>
          <p className="badge badge-soon">Bientôt disponible</p>
          <h3 id="premium-title">Export complet (Premium)</h3>
          <p>Sans filigrane, en meilleure résolution, avec davantage de produits.</p>
        </div>
        <button type="button" className="btn btn-dark" onClick={() => setPremiumOpen(true)}>
          <Icon name="lock" /> Débloquer l’export complet
        </button>
      </section>

      <Dialog
        open={premiumOpen}
        onClose={() => setPremiumOpen(false)}
        title="L’export complet arrive bientôt"
        footer={
          <>
            <Link to="/tarifs" className="btn">
              Voir les tarifs
            </Link>
            <button type="button" className="btn btn-dark" onClick={() => setPremiumOpen(false)}>
              J’ai compris
            </button>
          </>
        }
      >
        <p>
          <strong>Le paiement n’est pas encore disponible.</strong> Aucun achat n’est possible pour le moment et aucune
          somme ne vous sera demandée ici.
        </p>
        <p>L’offre Premium prévue comprendra :</p>
        <ul className="check-list">
          {PREMIUM_FEATURES.map((f) => (
            <li key={f}>
              <Icon name="sparkles" /> {f}
            </li>
          ))}
        </ul>
        <p>
          En attendant, l’export de démonstration est gratuit et utilisable.
          {SITE.contactEmail ? (
            <>
              {' '}
              Pour être prévenu du lancement, écrivez-nous à{' '}
              <a href={`mailto:${SITE.contactEmail}?subject=Offre%20Premium`}>{SITE.contactEmail}</a>.
            </>
          ) : null}
        </p>
      </Dialog>
    </div>
  );
}
