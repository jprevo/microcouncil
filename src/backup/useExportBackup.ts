import { useCallback } from "react";
import { backupFilename, buildBackup, serializeBackup } from "./exportBackup";
import { downloadJson } from "../lib/download";
import { useSaves } from "../saves/useSaves";
import { useAppState } from "../state/hooks";
import { useToast } from "../toast/useToast";
import { useLocale } from "../locale/useLocale";
import { useT } from "../locale/useT";

/** Writes the current state and every saved council to a file the user keeps. */
export function useExportBackup(): () => void {
  const state = useAppState();
  const { saves } = useSaves();
  const toast = useToast();
  const { code } = useLocale().bundle.meta;
  const t = useT();

  return useCallback((): void => {
    const now = Date.now();
    downloadJson(
      serializeBackup(buildBackup(state, saves, code, now)),
      backupFilename(now),
    );
    toast(t.backup.export.downloadedToast);
  }, [state, saves, code, toast, t]);
}
