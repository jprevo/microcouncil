import { parseBackup } from "./parseBackup";
import type { BackupParse } from "./parseBackup";

/** Reads a picked file and runs it through the validation gate. Never throws. */
export async function readBackupFile(file: File): Promise<BackupParse> {
  let text: string;
  try {
    text = await file.text();
  } catch {
    return { ok: false, reason: "Ce fichier n'a pas pu être lu." };
  }
  return parseBackup(text);
}
