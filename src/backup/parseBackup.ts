import { BACKUP_VERSION } from "./format";
import type { Backup } from "./format";
import { asNumber, asRecord, asString } from "../lib/json";
import { parseSaves } from "../saves/storage";
import { parseState } from "../storage";

/** A file either yields a usable backup, or a reason to show the user. */
export type BackupParse =
  | { readonly ok: true; readonly backup: Backup }
  | { readonly ok: false; readonly reason: string };

function invalid(reason: string): BackupParse {
  return { ok: false, reason };
}

/**
 * Brings a file written by an older version up to the current shape. Version 1 is
 * the first format, so nothing needs upgrading yet: every future bump adds one step
 * here, while a file from a newer version is refused rather than half-read.
 */
function migrate(
  record: Record<string, unknown>,
  version: number,
): Record<string, unknown> | null {
  return version === BACKUP_VERSION ? record : null;
}

/**
 * The gate every imported file goes through. It never throws and never trusts the
 * file: the payload is rebuilt by the same readers that guard the local storage, so
 * an entry the catalog no longer knows is dropped instead of poisoning the state.
 */
export function parseBackup(text: string): BackupParse {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return invalid("Ce fichier n'est pas du JSON lisible.");
  }

  const record = asRecord(value);
  if (record === null || Array.isArray(value))
    return invalid("Ce fichier n'est pas une sauvegarde Micro Council.");

  const version = asNumber(record["version"]);
  if (version === null)
    return invalid("Ce fichier ne porte pas de numéro de version.");

  const migrated = migrate(record, version);
  if (migrated === null)
    return invalid(
      version > BACKUP_VERSION
        ? `Ce fichier vient d'une version plus récente (version ${String(version)}).`
        : `La version ${String(version)} de ce fichier n'est plus prise en charge.`,
    );

  if (asRecord(migrated["state"]) === null)
    return invalid("Ce fichier ne contient pas de réglages.");
  if (!Array.isArray(migrated["saves"]))
    return invalid("Ce fichier ne contient pas de liste de sauvegardes.");

  return {
    ok: true,
    backup: {
      version: BACKUP_VERSION,
      exportedAt: asString(migrated["exportedAt"]),
      state: parseState(migrated["state"]),
      saves: parseSaves(migrated["saves"]),
    },
  };
}
