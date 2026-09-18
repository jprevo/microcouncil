import type { AppState, CouncilSave } from "../types";

/**
 * Shape version of an export file. Bump it whenever `state` or `saves` change in a
 * way an older file can no longer express, and teach `migrate` how to bring the
 * previous version up to this one.
 *
 * Version 2 namespaced storage — and this format — by language. Version 3 replaces
 * scene-based entries with group dynamics; its reader keeps other version 2 data.
 */
export const BACKUP_VERSION = 3;

/** Everything this browser holds for one language, in one portable file. */
export interface Backup {
  readonly version: number;
  /** ISO 8601 instant, so a file can be dated by eye as well as by code. */
  readonly exportedAt: string;
  /** The language this snapshot's cards and saves are written in. */
  readonly locale: string;
  readonly state: AppState;
  readonly saves: readonly CouncilSave[];
}

/** The instant the file was written, or null when the stamp is unreadable. */
export function exportedInstant(backup: Backup): number | null {
  const at = Date.parse(backup.exportedAt);
  return Number.isNaN(at) ? null : at;
}
