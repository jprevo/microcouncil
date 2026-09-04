import { BACKUP_VERSION } from "./format";
import type { Backup } from "./format";
import type { AppState, CouncilSave } from "../types";

/** Gathers the whole browser-side state into the file the user downloads. */
export function buildBackup(
  state: AppState,
  saves: readonly CouncilSave[],
  locale: string,
  now: number = Date.now(),
): Backup {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date(now).toISOString(),
    locale,
    state,
    saves,
  };
}

export function serializeBackup(backup: Backup): string {
  return JSON.stringify(backup, null, 2);
}

/** `microcouncil-2026-09-03.json`: sortable, and unique enough for one export a day. */
export function backupFilename(now: number = Date.now()): string {
  const day = new Date(now).toISOString().slice(0, 10);
  return `microcouncil-${day}.json`;
}
