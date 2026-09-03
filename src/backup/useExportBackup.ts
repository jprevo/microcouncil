import { useCallback } from "react";
import { backupFilename, buildBackup, serializeBackup } from "./exportBackup";
import { downloadJson } from "../lib/download";
import { useSaves } from "../saves/useSaves";
import { useAppState } from "../state/hooks";
import { useToast } from "../toast/useToast";

/** Writes the current state and every saved council to a file the user keeps. */
export function useExportBackup(): () => void {
  const state = useAppState();
  const { saves } = useSaves();
  const toast = useToast();

  return useCallback((): void => {
    const now = Date.now();
    downloadJson(
      serializeBackup(buildBackup(state, saves, now)),
      backupFilename(now),
    );
    toast("Vos données sont téléchargées");
  }, [state, saves, toast]);
}
