import { parseBackup } from "./parseBackup";
import type { BackupParse } from "./parseBackup";
import type { Catalogs } from "../lib/catalogs";
import type { UiStrings } from "../locale/types";

/** Reads a picked file and runs it through the validation gate. Never throws. */
export async function readBackupFile(
  file: File,
  catalogs: Catalogs,
  strings: UiStrings["backup"]["errors"],
): Promise<BackupParse> {
  let text: string;
  try {
    text = await file.text();
  } catch {
    return { ok: false, reason: strings.fileUnreadable };
  }
  return parseBackup(text, catalogs, strings);
}
