import type { AppState, CouncilSave, Library } from "../types";

/** What a backup carries, counted for the dialogs that announce it. */
export interface BackupSummary {
  readonly saves: number;
  /** Cards created or rewritten by the user, across both catalogs. */
  readonly cards: number;
}

function countLibrary<T>(library: Library<T>): number {
  return library.custom.length + Object.keys(library.overrides).length;
}

/** Counts the same way whether the data is on its way out or on its way in. */
export function summarize(
  state: AppState,
  saves: readonly CouncilSave[],
): BackupSummary {
  return {
    saves: saves.length,
    cards:
      countLibrary(state.memberLibrary) +
      countLibrary(state.environmentLibrary),
  };
}
