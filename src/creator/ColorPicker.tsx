import { useId } from 'react';
import { contrastRatio, isHexColor } from '../core/color';

const SWATCHES = [
  { hex: '#2447D5', name: 'Bleu' },
  { hex: '#1F8A4C', name: 'Vert' },
  { hex: '#D2452B', name: 'Rouge tomate' },
  { hex: '#E67E22', name: 'Orange' },
  { hex: '#C8416F', name: 'Rose' },
  { hex: '#7B3FA0', name: 'Violet' },
  { hex: '#9C6B3C', name: 'Bronze' },
  { hex: '#0E7C86', name: 'Turquoise' },
  { hex: '#1B1F3B', name: 'Bleu nuit' },
  { hex: '#222222', name: 'Noir' },
];

interface Props {
  value: string;
  onChange: (hex: string) => void;
  recommended?: { hex: string; label: string };
}

export function ColorPicker({ value, onChange, recommended }: Props) {
  const id = useId();
  const lowContrast = isHexColor(value) && contrastRatio(value, '#FFFFFF') < 2;
  return (
    <fieldset className="field color-field">
      <legend className="field-label">Couleur principale</legend>
      <div className="swatches" role="radiogroup" aria-label="Couleurs proposées">
        {SWATCHES.map((s) => (
          <button
            key={s.hex}
            type="button"
            role="radio"
            aria-checked={value.toUpperCase() === s.hex}
            className="swatch-btn"
            style={{ background: s.hex }}
            onClick={() => onChange(s.hex)}
            title={s.name}
          >
            <span className="visually-hidden">{s.name}</span>
          </button>
        ))}
        <label className="swatch-custom" htmlFor={`${id}-color`}>
          <input
            id={`${id}-color`}
            type="color"
            value={isHexColor(value) ? value : '#2447D5'}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
          />
          <span>Autre couleur</span>
        </label>
      </div>
      {recommended && value.toUpperCase() !== recommended.hex.toUpperCase() && (
        <button type="button" className="btn btn-sm btn-ghost recommended-color" onClick={() => onChange(recommended.hex)}>
          <span className="swatch" style={{ background: recommended.hex }} aria-hidden="true" />
          {recommended.label}
        </button>
      )}
      {lowContrast && (
        <p className="field-warning">
          Couleur très claire : les textes de couleur seront automatiquement assombris pour rester lisibles.
        </p>
      )}
    </fieldset>
  );
}
