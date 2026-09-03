import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { SavesContext } from "./context";
import { newSaveId, readSaves, sortAndTrim, writeSaves } from "./storage";
import { normalize } from "../lib/text";
import type { CouncilConfig, CouncilSave } from "../types";

/**
 * Saved councils, kept apart from the app state: changing them does not rebuild the
 * prompt, and typing in the subject field does not rewrite the list.
 */
export function SavesProvider({ children }: { readonly children: ReactNode }) {
  const [saves, setSaves] = useState<readonly CouncilSave[]>(readSaves);

  const save = useCallback((name: string, config: CouncilConfig): void => {
    const label = name.trim();
    const entry: CouncilSave = {
      ...config,
      id: newSaveId(),
      name: label,
      savedAt: Date.now(),
    };
    setSaves((current) => {
      const kept = current.filter(
        (candidate) => normalize(candidate.name) !== normalize(label),
      );
      const next = sortAndTrim([entry, ...kept]);
      writeSaves(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string): void => {
    setSaves((current) => {
      const next = current.filter((candidate) => candidate.id !== id);
      writeSaves(next);
      return next;
    });
  }, []);

  const replaceAll = useCallback((next: readonly CouncilSave[]): void => {
    const kept = sortAndTrim(next);
    writeSaves(kept);
    setSaves(kept);
  }, []);

  const api = useMemo(
    () => ({
      saves,
      save,
      remove,
      replaceAll,
      findByName: (name: string): CouncilSave | undefined =>
        saves.find(
          (candidate) => normalize(candidate.name) === normalize(name),
        ),
    }),
    [saves, save, remove, replaceAll],
  );

  return <SavesContext value={api}>{children}</SavesContext>;
}
