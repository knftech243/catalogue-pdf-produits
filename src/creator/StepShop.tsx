import { useRef, useState } from 'react';
import { ConfirmDialog } from '../components/Dialog';
import { Icon } from '../components/Icon';
import { createId, LIMITS } from '../core/defaults';
import { CURRENCIES, formatPrice } from '../core/price';
import { isValidEmail, whatsappDigits } from '../core/text';
import type { CurrencyCode } from '../core/types';
import { sampleShopInfo } from '../demo/shops';
import { TextField, SelectField } from './fields';
import { ACCEPT_ATTRIBUTE, LOGO_IMAGE, processImage, ImageImportError } from './imageProcessing';
import { useCreator } from './state';
import { ColorPicker } from './ColorPicker';

export function StepShop({ showErrors }: { showErrors: boolean }) {
  const { data, setShop, images, addImage } = useCreator();
  const shop = data.shop;
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [confirmSample, setConfirmSample] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const nameError = showErrors && !shop.name.trim() ? 'Indiquez le nom de votre boutique.' : null;
  const emailWarning =
    shop.email.trim() && !isValidEmail(shop.email)
      ? 'Cette adresse e-mail semble incomplète (exemple : nom@gmail.com).'
      : null;
  const waWarning =
    shop.whatsapp.trim() && !whatsappDigits(shop.whatsapp)
      ? 'Ajoutez l’indicatif du pays pour activer les liens WhatsApp dans le PDF (exemple : +243 81 234 5678).'
      : null;

  const hasContent = [
    shop.name,
    shop.slogan,
    shop.whatsapp,
    shop.phone,
    shop.email,
    shop.address,
  ].some((v) => v.trim());

  const applySample = () => {
    const sample = sampleShopInfo();
    setShop({ ...sample, logoId: shop.logoId });
    setConfirmSample(false);
  };

  const onLogo = async (file: File | undefined) => {
    if (!file) return;
    setLogoError(null);
    setLogoBusy(true);
    try {
      const processed = await processImage(file, LOGO_IMAGE);
      const id = createId('logo');
      await addImage({ id, ...processed });
      setShop({ logoId: id });
    } catch (e) {
      setLogoError(
        e instanceof ImageImportError
          ? e.message
          : 'Impossible d’utiliser ce logo. Essayez une autre image.',
      );
    } finally {
      setLogoBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const logo = shop.logoId ? images.get(shop.logoId) : undefined;
  const currencyExample = formatPrice(12500, shop.currency).replace(/\u00A0/g, ' ');

  return (
    <div className="step-body">
      <div className="step-intro">
        <h2>Votre boutique</h2>
        <p>
          Ces informations apparaissent sur la couverture et en bas de chaque page. Seul le nom est
          obligatoire.
        </p>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => (hasContent ? setConfirmSample(true) : applySample())}
        >
          <Icon name="sparkles" /> Utiliser des données d’exemple
        </button>
      </div>

      <fieldset className="form-section">
        <legend>Identité</legend>
        <div className="form-grid">
          <TextField
            label="Nom de la boutique"
            value={shop.name}
            onChange={(e) => setShop({ name: e.target.value })}
            maxLength={LIMITS.shopNameMaxLength}
            placeholder="Ex. : Boutique Mwinda"
            autoComplete="organization"
            error={nameError}
            id="shop-name"
          />
          <TextField
            label="Slogan"
            optional
            value={shop.slogan}
            onChange={(e) => setShop({ slogan: e.target.value })}
            maxLength={LIMITS.sloganMaxLength}
            placeholder="Ex. : Qualité et petits prix, livrés chez vous"
          />
          <TextField
            label="Nom du propriétaire"
            optional
            value={shop.owner}
            onChange={(e) => setShop({ owner: e.target.value })}
            maxLength={60}
            autoComplete="name"
            hint="Non affiché dans le catalogue : utile seulement pour vous."
          />
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Contacts</legend>
        <div className="form-grid">
          <TextField
            label="Numéro WhatsApp"
            optional
            type="tel"
            inputMode="tel"
            value={shop.whatsapp}
            onChange={(e) => setShop({ whatsapp: e.target.value })}
            placeholder="+243 81 234 5678"
            maxLength={24}
            autoComplete="tel"
            warning={waWarning}
            hint="Avec l’indicatif du pays : vos clients pourront vous écrire en touchant le PDF."
          />
          <TextField
            label="Numéro de téléphone"
            optional
            type="tel"
            inputMode="tel"
            value={shop.phone}
            onChange={(e) => setShop({ phone: e.target.value })}
            placeholder="+243 99 123 4567"
            maxLength={24}
            hint="Laissez vide s’il est identique au numéro WhatsApp."
          />
          <TextField
            label="E-mail"
            optional
            type="email"
            inputMode="email"
            value={shop.email}
            onChange={(e) => setShop({ email: e.target.value })}
            placeholder="boutique@gmail.com"
            maxLength={80}
            autoComplete="email"
            warning={emailWarning}
          />
          <TextField
            label="Ville ou adresse"
            optional
            value={shop.address}
            onChange={(e) => setShop({ address: e.target.value })}
            placeholder="Ex. : Kinshasa, Gombe"
            maxLength={90}
            autoComplete="street-address"
          />
          <TextField
            label="Instagram"
            optional
            value={shop.instagram}
            onChange={(e) => setShop({ instagram: e.target.value })}
            placeholder="@maboutique"
            maxLength={80}
          />
          <TextField
            label="Facebook"
            optional
            value={shop.facebook}
            onChange={(e) => setShop({ facebook: e.target.value })}
            placeholder="facebook.com/maboutique"
            maxLength={100}
          />
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Prix et apparence</legend>
        <div className="form-grid">
          <SelectField
            label="Devise"
            value={shop.currency.code}
            onChange={(e) =>
              setShop({ currency: { ...shop.currency, code: e.target.value as CurrencyCode } })
            }
            hint={`Exemple d’affichage : ${currencyExample}`}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </SelectField>
          {shop.currency.code === 'CUSTOM' && (
            <div className="form-row-2">
              <TextField
                label="Symbole"
                value={shop.currency.customSymbol}
                onChange={(e) =>
                  setShop({ currency: { ...shop.currency, customSymbol: e.target.value } })
                }
                placeholder="Ex. : GNF"
                maxLength={8}
                error={
                  showErrors && !shop.currency.customSymbol.trim()
                    ? 'Indiquez le symbole de la devise.'
                    : null
                }
              />
              <SelectField
                label="Position"
                value={shop.currency.customPosition}
                onChange={(e) =>
                  setShop({
                    currency: {
                      ...shop.currency,
                      customPosition: e.target.value as 'before' | 'after',
                    },
                  })
                }
              >
                <option value="after">Après le prix (12 500 GNF)</option>
                <option value="before">Avant le prix (GNF 12 500)</option>
              </SelectField>
            </div>
          )}
        </div>

        <ColorPicker
          value={shop.primaryColor}
          onChange={(primaryColor) => setShop({ primaryColor })}
        />

        <div className="field logo-field">
          <span className="field-label" id="logo-label">
            Logo <span className="field-optional">(facultatif)</span>
          </span>
          <div className="logo-row">
            <div className="logo-preview" aria-hidden={!logo}>
              {logo ? (
                <img src={logo.thumbUrl} alt="Logo de la boutique" />
              ) : (
                <Icon name="image" size={28} />
              )}
            </div>
            <div className="logo-actions">
              <input
                ref={fileRef}
                type="file"
                accept={ACCEPT_ATTRIBUTE}
                className="visually-hidden"
                id="logo-input"
                aria-labelledby="logo-label"
                onChange={(e) => onLogo(e.target.files?.[0])}
              />
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => fileRef.current?.click()}
                disabled={logoBusy}
              >
                {logoBusy ? (
                  <span className="spinner" aria-hidden="true" />
                ) : (
                  <Icon name="upload" />
                )}
                {logo ? 'Changer le logo' : 'Ajouter un logo'}
              </button>
              {logo && (
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => setShop({ logoId: null })}
                >
                  <Icon name="trash" /> Retirer
                </button>
              )}
            </div>
          </div>
          <p className="field-hint">
            PNG avec fond transparent conseillé. Le logo apparaît sur la couverture.
          </p>
          {logoError && (
            <p className="field-error" role="alert">
              <Icon name="alert" size={16} /> {logoError}
            </p>
          )}
        </div>
      </fieldset>

      <ConfirmDialog
        open={confirmSample}
        title="Remplacer les informations ?"
        message={
          <p>
            Les informations de votre boutique seront remplacées par une boutique fictive d’exemple.
            Vos produits ne sont pas modifiés.
          </p>
        }
        confirmLabel="Remplacer"
        onConfirm={applySample}
        onCancel={() => setConfirmSample(false)}
      />
    </div>
  );
}
