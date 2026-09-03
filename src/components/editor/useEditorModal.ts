import { useCallback, useState } from "react";

export interface EditorModal<T> {
  readonly open: boolean;
  /** The entry being edited, or null when one is being created. */
  readonly entry: T | null;
  readonly create: () => void;
  readonly edit: (entry: T) => void;
  readonly close: () => void;
}

/** Opens and closes an editor dialog, whatever kind of entry it is aimed at. */
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
