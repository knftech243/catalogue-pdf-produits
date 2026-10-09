// Outil « Créer mon catalogue » : parcours guidé en 5 étapes.

import { useCallback, useEffect, useRef, useState } from 'react';
import { ConfirmDialog, Dialog } from '../components/Dialog';
import { Icon, type IconName } from '../components/Icon';
import { PRIVACY_NOTICE } from '../config/site';
import { DEMO_SHOPS, type DemoId } from '../demo/shops';
import { useRouter } from '../router/router';
import { DataPanel } from './DataPanel';
import { buildDemo } from './loadDemo';
import { CreatorProvider, productStats, useCreator } from './state';
import { StepExport } from './StepExport';
import { StepPreview } from './StepPreview';
import { StepProducts } from './StepProducts';
import { StepShop } from './StepShop';
import { StepTemplate } from './StepTemplate';
import '../styles/creator.css';

const STEPS: { label: string; icon: IconName }[] = [
  { label: 'Boutique', icon: 'store' },
  { label: 'Produits', icon: 'box' },
  { label: 'Modèle', icon: 'palette' },
  { label: 'Aperçu', icon: 'eye' },
  { label: 'Télécharger', icon: 'download' },
];

const SAVE_LABELS = {
  idle: 'Sauvegarde locale',
  saved: 'Enregistré sur cet appareil',
  disabled: 'Sauvegarde désactivée',
  error: 'Espace de stockage plein',
  unavailable: 'Sauvegarde indisponible',
} as const;

function readStep(search: string): number {
  const n = Number(new URLSearchParams(search).get('etape'));
  return Number.isInteger(n) && n >= 1 && n <= STEPS.length ? n : 1;
}

function Creator() {
  const { search, navigate } = useRouter();
  const { data, ready, saveStatus, loadData, reset, restoreIssue, dismissRestoreIssue } =
    useCreator();
  const step = readStep(search);
  const [showErrors, setShowErrors] = useState<Record<number, boolean>>({});
  const [announcement, setAnnouncement] = useState('');
  const [demoDialog, setDemoDialog] = useState(false);
  const [pendingDemo, setPendingDemo] = useState<DemoId | null>(null);
  const [demoProgress, setDemoProgress] = useState<{ done: number; total: number } | null>(null);
  const [dataPanel, setDataPanel] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const stats = productStats(data.products);
  const hasWork = data.products.length > 0 || data.shop.name.trim().length > 0;

  const announce = useCallback((message: string) => {
    setAnnouncement('');
    requestAnimationFrame(() => setAnnouncement(message));
  }, []);

  const canLeave = useCallback(
    (from: number): string | null => {
      if (from === 1 && !data.shop.name.trim())
        return 'Indiquez le nom de votre boutique pour continuer.';
      if (
        from === 1 &&
        data.shop.currency.code === 'CUSTOM' &&
        !data.shop.currency.customSymbol.trim()
      )
        return 'Indiquez le symbole de votre devise pour continuer.';
      if (from === 2 && stats.complete === 0)
        return data.products.length === 0
          ? 'Ajoutez au moins un produit pour continuer.'
          : 'Complétez au moins un produit (nom et prix) pour continuer.';
      return null;
    },
    [data.shop.name, data.shop.currency, data.products.length, stats.complete],
  );

  const goTo = useCallback(
    (target: number) => {
      if (target > step) {
        for (let s = step; s < target; s++) {
          const problem = canLeave(s);
          if (problem) {
            setShowErrors((e) => ({ ...e, [s]: true }));
            announce(problem);
            if (s !== step) navigate(`/creer?etape=${s}`);
            requestAnimationFrame(() => {
              const el =
                document.querySelector<HTMLElement>('[aria-invalid="true"]') ??
                document.getElementById('products-error');
              el?.focus?.();
              el?.scrollIntoView({ block: 'center' });
            });
            return;
          }
        }
      }
      navigate(`/creer?etape=${target}`);
      requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: false }));
    },
    [step, canLeave, navigate, announce],
  );

  const startDemo = useCallback(
    async (id: DemoId) => {
      setDemoDialog(false);
      setPendingDemo(null);
      setDemoProgress({ done: 0, total: 1 });
      try {
        const demo = await buildDemo(id, (done, total) => setDemoProgress({ done, total }));
        await loadData(demo.data, demo.images);
        announce(
          `Boutique exemple « ${demo.data.shop.name} » chargée avec ${demo.data.products.length} produits.`,
        );
        navigate('/creer?etape=2', { replace: true });
      } catch {
        announce('Le chargement de l’exemple a échoué. Réessayez.');
      } finally {
        setDemoProgress(null);
      }
    },
    [loadData, navigate, announce],
  );

  const requestDemo = useCallback(
    (id: DemoId) => {
      if (hasWork) setPendingDemo(id);
      else void startDemo(id);
    },
    [hasWork, startDemo],
  );

  // Lien « Ouvrir cet exemple » depuis la page Exemples : /creer?exemple=vetements
  const demoParamHandled = useRef(false);
  useEffect(() => {
    if (!ready || demoParamHandled.current) return;
    const param = new URLSearchParams(search).get('exemple') as DemoId | null;
    if (param && DEMO_SHOPS.some((d) => d.id === param)) {
      demoParamHandled.current = true;
      // Effet volontaire : synchronisation unique avec un paramètre d'adresse, une fois les données
      // locales chargées (ouvre la confirmation ou lance la préparation asynchrone de l'exemple).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      requestDemo(param);
    }
  }, [ready, search, requestDemo]);

  const restart = async () => {
    await reset();
    setShowErrors({});
    announce('Tout a été effacé. Vous pouvez créer un nouveau catalogue.');
    navigate('/creer?etape=1');
  };

  if (!ready) {
    return (
      <div className="container creator-loading" role="status">
        <span className="spinner" aria-hidden="true" />
        <span>Chargement de votre travail…</span>
      </div>
    );
  }

  return (
    <div className="creator">
      <div className="container">
        <div className="creator-head">
          <div>
            <h1>Créer mon catalogue</h1>
            <p className="privacy-inline">
              <Icon name="shield" size={18} /> {PRIVACY_NOTICE}
            </p>
          </div>
          <button
            type="button"
            className={`save-status is-${saveStatus}`}
            onClick={() => setDataPanel(true)}
          >
            <Icon
              name={saveStatus === 'error' || saveStatus === 'unavailable' ? 'alert' : 'save'}
              size={18}
            />
            <span>{SAVE_LABELS[saveStatus]}</span>
            <span className="save-status-more">Données sur cet appareil</span>
          </button>
        </div>

        {restoreIssue && (
          <div className="notice notice-warning" role="status">
            <Icon name="alert" />
            <div>
              <p>
                <strong>Votre sauvegarde précédente n’a pas pu être relue.</strong> Un nouveau
                catalogue vide a été ouvert : vous pouvez continuer normalement.
              </p>
              <p>
                {restoreIssue.backupSaved
                  ? 'Par précaution, une copie de l’ancienne sauvegarde est gardée sur cet appareil. Rien n’a été envoyé sur Internet.'
                  : 'L’ancienne sauvegarde reste sur cet appareil tant que vous ne modifiez rien. Rien n’a été envoyé sur Internet.'}
              </p>
              <button type="button" className="btn btn-sm" onClick={dismissRestoreIssue}>
                J’ai compris
              </button>
            </div>
          </div>
        )}

        <nav className="stepper" aria-label="Étapes de création">
          <p className="stepper-mobile" aria-hidden="true">
            Étape {step} sur {STEPS.length} — <strong>{STEPS[step - 1].label}</strong>
          </p>
          <div className="stepper-bar" aria-hidden="true">
            <div
              className="stepper-fill"
              style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
          <ol>
            {STEPS.map((s, i) => {
              const n = i + 1;
              const state = n < step ? 'done' : n === step ? 'current' : 'todo';
              return (
                <li key={s.label} className={`step-item is-${state}`}>
                  <button
                    type="button"
                    onClick={() => goTo(n)}
                    aria-current={n === step ? 'step' : undefined}
                    aria-label={`Étape ${n} : ${s.label}${state === 'done' ? ' (terminée)' : ''}`}
                  >
                    <span className="step-dot">
                      {state === 'done' ? <Icon name="check" size={16} /> : n}
                    </span>
                    <span className="step-label">{s.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <h2 className="visually-hidden" tabIndex={-1} ref={headingRef}>
          Étape {step} : {STEPS[step - 1].label}
        </h2>

        {step === 1 && <StepShop showErrors={!!showErrors[1]} />}
        {step === 2 && (
          <StepProducts
            onOpenDemo={() => setDemoDialog(true)}
            announce={announce}
            showErrors={!!showErrors[2]}
          />
        )}
        {step === 3 && <StepTemplate />}
        {step === 4 && <StepPreview goTo={goTo} onRestart={restart} />}
        {step === 5 && <StepExport />}
      </div>

      <div className="step-nav">
        <div className="container step-nav-inner">
          {step > 1 ? (
            <button type="button" className="btn" onClick={() => goTo(step - 1)}>
              <Icon name="arrowLeft" /> Retour
            </button>
          ) : (
            <span />
          )}
          {step < STEPS.length && (
            <button type="button" className="btn btn-dark" onClick={() => goTo(step + 1)}>
              {step === 4 ? 'Télécharger' : 'Suivant'} <Icon name="arrowRight" />
            </button>
          )}
        </div>
      </div>

      <div className="visually-hidden" aria-live="polite" role="status">
        {announcement}
      </div>

      <Dialog
        open={demoDialog}
        onClose={() => setDemoDialog(false)}
        title="Charger une boutique exemple"
      >
        <p>
          Découvrez l’outil avec une boutique fictive complète (au moins 12 produits). Vous pourrez
          tout modifier.
        </p>
        <div className="demo-choices">
          {DEMO_SHOPS.map((d) => (
            <button
              key={d.id}
              type="button"
              className="demo-choice"
              onClick={() => requestDemo(d.id)}
            >
              <strong>{d.label}</strong>
              <span>
                {d.shop.name} · {d.products.length} produits
              </span>
            </button>
          ))}
        </div>
      </Dialog>

      <ConfirmDialog
        open={pendingDemo !== null}
        title="Remplacer votre catalogue ?"
        message={
          <p>
            Votre boutique et vos produits actuels seront remplacés par l’exemple. Cette action ne
            peut pas être annulée.
          </p>
        }
        confirmLabel="Remplacer par l’exemple"
        danger
        onConfirm={() => pendingDemo && void startDemo(pendingDemo)}
        onCancel={() => {
          setPendingDemo(null);
          navigate('/creer', { replace: true });
        }}
      />

      <Dialog open={demoProgress !== null} onClose={() => {}} title="Préparation de l’exemple" busy>
        <div role="status" className="progress-head">
          <span className="spinner" aria-hidden="true" />
          <span>
            Préparation des photos d’exemple…{' '}
            {demoProgress ? `${demoProgress.done} / ${demoProgress.total}` : ''}
          </span>
        </div>
      </Dialog>

      <DataPanel open={dataPanel} onClose={() => setDataPanel(false)} onCleared={restart} />
    </div>
  );
}

export default function CreatorPage() {
  return (
    <CreatorProvider>
      <Creator />
    </CreatorProvider>
  );
}
