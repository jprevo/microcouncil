import { BACKUP_VERSION } from "./format";
import type { Backup } from "./format";
import { asNumber, asRecord, asString } from "../lib/json";
import { parseSaves } from "../saves/storage";
import { parseState } from "../storage";
import type { Catalogs } from "../lib/catalogs";
import type { UiStrings } from "../locale/types";
import { format } from "../locale/i18n";

/** A file either yields a usable backup, or a reason to show the user. */
export type BackupParse =
  | { readonly ok: true; readonly backup: Backup }
  | { readonly ok: false; readonly reason: string };

function invalid(reason: string): BackupParse {
  return { ok: false, reason };
}

/**
 * Brings a file written by an older version up to the current shape. Version 1
 * predates per-language storage and carries no `locale`, so there is nothing
 * sound to upgrade it to: every future bump adds a real step here, while a file
 * from a newer version is refused rather than half-read.
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
export function parseBackup(
  text: string,
  catalogs: Catalogs,
  strings: UiStrings["backup"]["errors"],
): BackupParse {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return invalid(strings.unreadableJson);
  }

  const record = asRecord(value);
  if (record === null || Array.isArray(value))
    return invalid(strings.notABackup);

  const version = asNumber(record["version"]);
  if (version === null) return invalid(strings.noVersion);

  const migrated = migrate(record, version);
  if (migrated === null)
    return invalid(
      version > BACKUP_VERSION
        ? format(strings.versionTooNew, { version })
        : format(strings.versionUnsupported, { version }),
    );

  if (asRecord(migrated["state"]) === null) return invalid(strings.noState);
  if (!Array.isArray(migrated["saves"])) return invalid(strings.noSaves);

  return {
    ok: true,
    backup: {
      version: BACKUP_VERSION,
      exportedAt: asString(migrated["exportedAt"]),
      locale: asString(migrated["locale"]),
      state: parseState(migrated["state"], catalogs),
      saves: parseSaves(migrated["saves"]),
    },
  };
}
