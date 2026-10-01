import { useEffect, useState } from 'react';
import { ConfirmDialog, Dialog } from '../components/Dialog';
import { Icon } from '../components/Icon';
import { formatBytes } from '../core/text';
import { Link } from '../router/router';
import { useCreator } from './state';
import { estimateUsage, isLocalStorageAvailable } from './storage';

interface Props {
  open: boolean;
  onClose: () => void;
  onCleared: () => Promise<void>;
}

export function DataPanel({ open, onClose, onCleared }: Props) {
  const { prefs, setAutosave, saveStatus } = useCreator();
  const [usage, setUsage] = useState<number | null>(null);
  const [confirm, setConfirm] = useState(false);
  const available = isLocalStorageAvailable();

  useEffect(() => {
    if (open) void estimateUsage().then(setUsage);
  }, [open, prefs.autosave]);

  return (
    <>
      <Dialog open={open && !confirm} onClose={onClose} title="Données sur cet appareil">
        <p>
          Votre catalogue (textes, réglages et photos) peut être enregistré <strong>uniquement dans ce navigateur</strong>,
          sur cet appareil, pour que vous retrouviez votre travail plus tard. Rien n’est envoyé sur Internet.
        </p>
        {!available && (
          <p className="notice notice-warning">
            <Icon name="alert" />
            <span>
              Votre navigateur bloque l’enregistrement local (navigation privée ?). Votre travail sera perdu si vous
              fermez la page : téléchargez votre PDF avant.
            </span>
          </p>
        )}
        <label className="checkbox">
          <input
            type="checkbox"
            checked={prefs.autosave}
            disabled={!available}
            onChange={(e) => void setAutosave(e.target.checked)}
          />
          <span>
            <strong>Sauvegarde automatique sur cet appareil</strong>
            <span className="field-hint">
              Désactiver la sauvegarde efface aussi les données déjà enregistrées. Votre travail reste affiché jusqu’à la
              fermeture de la page.
            </span>
          </span>
        </label>
        {saveStatus === 'error' && (
          <p className="notice notice-danger">
            <Icon name="alert" />
            <span>L’espace de stockage du navigateur est plein. Supprimez des photos ou libérez de l’espace.</span>
          </p>
        )}
        {usage != null && (
          <p className="field-hint">Espace utilisé par ce site dans le navigateur : environ {formatBytes(usage)}.</p>
        )}
        <div className="panel-actions">
          <button type="button" className="btn btn-danger" onClick={() => setConfirm(true)}>
            <Icon name="trash" /> Effacer mes données locales
          </button>
          <Link to="/confidentialite" className="btn btn-ghost btn-sm">
            Politique de confidentialité
          </Link>
        </div>
      </Dialog>
      <ConfirmDialog
        open={confirm}
        title="Effacer toutes vos données ?"
        message={
          <p>
            La boutique, les produits et les photos seront effacés de cet appareil et de l’écran. Cette action est
            définitive.
          </p>
        }
        confirmLabel="Effacer définitivement"
        danger
        onConfirm={async () => {
          setConfirm(false);
          onClose();
          await onCleared();
        }}
        onCancel={() => setConfirm(false)}
      />
    </>
  );
}
