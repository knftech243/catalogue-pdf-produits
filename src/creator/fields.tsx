// Champs de formulaire accessibles : libellé, aide et message d'erreur reliés au champ.

import { useId, type ComponentPropsWithRef, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Icon } from '../components/Icon';

interface BaseProps {
  label: string;
  optional?: boolean;
  hint?: ReactNode;
  error?: string | null;
  /** Avertissement non bloquant. */
  warning?: string | null;
  counter?: { value: number; max: number };
}

function Meta({ id, hint, error, warning, counter }: BaseProps & { id: string }) {
  return (
    <>
      {hint && (
        <p className="field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {counter && (
        <p className="field-hint field-counter" aria-hidden="true">
          {counter.value} / {counter.max}
        </p>
      )}
      {error && (
        <p className="field-error" id={`${id}-error`}>
          <Icon name="alert" size={16} /> {error}
        </p>
      )}
      {!error && warning && (
        <p className="field-warning" id={`${id}-error`}>
          <Icon name="info" size={16} /> {warning}
        </p>
      )}
    </>
  );
}

function describedBy(id: string, p: BaseProps) {
  return [p.hint ? `${id}-hint` : '', p.error || p.warning ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
}

function Label({ id, label, optional }: { id: string; label: string; optional?: boolean }) {
  return (
    <label className="field-label" htmlFor={id}>
      {label} {optional ? <span className="field-optional">(facultatif)</span> : <span className="field-required">*</span>}
    </label>
  );
}

export function TextField(props: BaseProps & ComponentPropsWithRef<'input'>) {
  const { label, optional, hint, error, warning, counter, id: givenId, ...input } = props;
  const autoId = useId();
  const id = givenId ?? autoId;
  return (
    <div className="field">
      <Label id={id} label={label} optional={optional} />
      <input
        id={id}
        className="input"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, props)}
        {...input}
      />
      <Meta id={id} label={label} hint={hint} error={error} warning={warning} counter={counter} />
    </div>
  );
}

export function TextAreaField(props: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { label, optional, hint, error, warning, counter, id: givenId, ...input } = props;
  const autoId = useId();
  const id = givenId ?? autoId;
  return (
    <div className="field">
      <Label id={id} label={label} optional={optional} />
      <textarea
        id={id}
        className="textarea"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, props)}
        {...input}
      />
      <Meta id={id} label={label} hint={hint} error={error} warning={warning} counter={counter} />
    </div>
  );
}

export function SelectField(props: BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  const { label, optional, hint, error, warning, id: givenId, children, ...select } = props;
  const autoId = useId();
  const id = givenId ?? autoId;
  return (
    <div className="field">
      <Label id={id} label={label} optional={optional} />
      <select id={id} className="select" aria-describedby={describedBy(id, props)} {...select}>
        {children}
      </select>
      <Meta id={id} label={label} hint={hint} error={error} warning={warning} />
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="checkbox">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <strong>{label}</strong>
        {description && <span className="field-hint">{description}</span>}
      </span>
    </label>
  );
}
