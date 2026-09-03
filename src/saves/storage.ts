import { asNumber, asRecord, asString, readJson, writeJson } from "../lib/json";
import { asEnvironment, asMember, asTarget } from "../lib/parse";
import type { CouncilSave, Environment, Member, SavedEntry } from "../types";

const STORAGE_KEY = "microcouncil.saves.v2";

/** Past this count, the oldest saves make room for new ones. */
export const MAX_SAVES = 100;

/** Reads back a saved entry and its slot, or null when either one is missing. */
function asEntry<T>(
  value: unknown,
  asItem: (value: unknown) => T | null,
): SavedEntry<T> | null {
  const record = asRecord(value);
  if (record === null) return null;
  const target = asTarget(record["target"]);
  const item = asItem(record["item"]);
  if (target === null || item === null) return null;
  return { target, item, edited: record["edited"] === true };
}

/** Reads back a stored save, or null when it does not have the expected shape. */
function asSave(value: unknown): CouncilSave | null {
  const record = asRecord(value);
  if (record === null) return null;

  const id = asString(record["id"]);
  const name = asString(record["name"]).trim();
  const savedAt = asNumber(record["savedAt"]);
  if (id === "" || name === "" || savedAt === null) return null;

  const members: SavedEntry<Member>[] = [];
  for (const stored of Array.isArray(record["members"])
    ? record["members"]
    : []) {
    const entry = asEntry(stored, asMember);
    if (entry !== null) members.push(entry);
  }

  const environment: SavedEntry<Environment> | null = asEntry(
    record["environment"],
    asEnvironment,
  );

  return {
    id,
    name,
    savedAt,
    members,
    environment,
    username: asString(record["username"]),
    customInstructions: asString(record["customInstructions"]),
    subject: asString(record["subject"]),
  };
}

/** Reads a stored list, newest first, dropping unreadable and duplicate entries. */
export function parseSaves(value: unknown): readonly CouncilSave[] {
  if (!Array.isArray(value)) return [];
  const saves: CouncilSave[] = [];
  const seen = new Set<string>();
  for (const stored of value) {
    const save = asSave(stored);
    if (save === null || seen.has(save.id)) continue;
    seen.add(save.id);
    saves.push(save);
  }
  return sortAndTrim(saves);
}

/** The stored list, newest first. */
export function readSaves(): readonly CouncilSave[] {
  return parseSaves(readJson(STORAGE_KEY));
}

export function writeSaves(saves: readonly CouncilSave[]): void {
  writeJson(STORAGE_KEY, saves);
}

/** Sorts newest first and drops the oldest ones past the limit. */
export function sortAndTrim(
  saves: readonly CouncilSave[],
): readonly CouncilSave[] {
  return [...saves].sort((a, b) => b.savedAt - a.savedAt).slice(0, MAX_SAVES);
}

/** An opaque, stable id, even where `randomUUID` is unavailable. */
export function newSaveId(): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  return (
    uuid ??
    // Fallback with no cryptographic ambition: this is a list key, not a secret.
    // eslint-disable-next-line sonarjs/pseudo-random
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  );
}
