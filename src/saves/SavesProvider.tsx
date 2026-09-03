import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { SavesContext } from "./context";
import { newSaveId, readSaves, sortAndTrim, writeSaves } from "./storage";
import { normalize } from "../lib/text";
import type { CouncilConfig, CouncilSave } from "../types";

/**
 * Les conseils enregistrés, tenus à part de l'état de l'application : les modifier
 * ne rejoue pas le prompt, et taper dans le sujet ne réécrit pas la liste.
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
