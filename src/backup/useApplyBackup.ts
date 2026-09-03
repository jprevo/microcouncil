import { useCallback } from "react";
import type { Backup } from "./format";
import { useSaves } from "../saves/useSaves";
import { useAppDispatch } from "../state/hooks";
import { useToast } from "../toast/useToast";

/** Puts a validated backup in place of everything this browser holds. */
export function useApplyBackup(): (backup: Backup) => void {
  const dispatch = useAppDispatch();
  const { replaceAll } = useSaves();
  const toast = useToast();

  return useCallback(
    (backup: Backup): void => {
      // State first, saves second: each is written in one go, so no intermediate
      // render mixes the old council with the new list.
      dispatch({ type: "replaceState", state: backup.state });
      replaceAll(backup.saves);
      toast("Vos données sont restaurées");
    },
    [dispatch, replaceAll, toast],
  );
}
