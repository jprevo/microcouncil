import type { ReactNode } from "react";

/**
 * A message spoken when it changes and drawn nowhere: for the results of an
 * action a sighted user reads off the page — a filtered list shrinking, say —
 * and that would otherwise happen in silence.
 */
export function Status({ children }: { readonly children: ReactNode }) {
  return (
    <p className="visually-hidden" role="status">
      {children}
    </p>
  );
}
