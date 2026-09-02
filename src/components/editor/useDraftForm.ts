import { useState } from "react";

export interface DraftForm<D> {
  readonly draft: D;
  /** Message de validation, affiché seulement après une tentative d'enregistrement. */
  readonly error: string | null;
  readonly update: (patch: Partial<D>) => void;
  readonly save: () => void;
}

interface DraftFormOptions<D> {
  readonly initial: D;
  readonly validate: (draft: D) => string | null;
  /** Enregistrement effectif : appelé seulement sur un brouillon valide. */
  readonly commit: (draft: D) => void;
}

/** Brouillon de fiche : saisie champ par champ, validation à l'enregistrement. */
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
