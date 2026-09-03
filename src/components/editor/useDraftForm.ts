import { useState } from "react";

export interface DraftForm<D> {
  readonly draft: D;
  /** Validation message, shown only once saving has been attempted. */
  readonly error: string | null;
  readonly update: (patch: Partial<D>) => void;
  readonly save: () => void;
}

interface DraftFormOptions<D> {
  readonly initial: D;
  readonly validate: (draft: D) => string | null;
  /** The actual save: only ever called with a valid draft. */
  readonly commit: (draft: D) => void;
}

/** An entry being drafted: typed field by field, validated on save. */
export function useDraftForm<D extends object>({
  initial,
  validate,
  commit,
}: DraftFormOptions<D>): DraftForm<D> {
  const [draft, setDraft] = useState<D>(initial);
  const [error, setError] = useState<string | null>(null);

  const update = (patch: Partial<D>): void => {
    setDraft((current) => ({ ...current, ...patch }));
    setError(null);
  };

  const save = (): void => {
    const problem = validate(draft);
    if (problem !== null) {
      setError(problem);
      return;
    }
    commit(draft);
  };

  return { draft, error, update, save };
}
