import type { ReactNode } from "react";

interface FieldProps {
  /** Id of the control the label describes. */
  readonly htmlFor: string;
  readonly label: string;
  readonly hint?: string;
  readonly children: ReactNode;
}

/** One form row: a label, the control, and an optional hint. */
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
