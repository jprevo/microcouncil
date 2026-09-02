import { useCallback, useState } from "react";

export interface EditorModal<T> {
  readonly open: boolean;
  /** La fiche éditée, ou null lorsqu'il s'agit d'une création. */
  readonly entry: T | null;
  readonly create: () => void;
  readonly edit: (entry: T) => void;
  readonly close: () => void;
}

/** Ouverture et fermeture d'une boîte d'édition, quelle que soit la fiche visée. */
export function useEditorModal<T>(): EditorModal<T> {
  const [open, setOpen] = useState(false);
  const [entry, setEntry] = useState<T | null>(null);

  const create = useCallback((): void => {
    setEntry(null);
    setOpen(true);
  }, []);

  const edit = useCallback((target: T): void => {
    setEntry(target);
    setOpen(true);
  }, []);

  const close = useCallback((): void => setOpen(false), []);

  return { open, entry, create, edit, close };
}
