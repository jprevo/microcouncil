import type { ReactNode } from "react";

interface FieldProps {
  /** Identifiant du contrôle décrit par le libellé. */
  readonly htmlFor: string;
  readonly label: string;
  readonly hint?: string;
  readonly children: ReactNode;
}

/** Ligne de formulaire : libellé, contrôle, et une aide optionnelle. */
export function Field({ htmlFor, label, hint, children }: FieldProps) {
  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint === undefined ? null : <p className="form-field__hint">{hint}</p>}
    </div>
  );
}
