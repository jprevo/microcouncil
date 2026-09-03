import { asNumber, asRecord, asString, readJson, writeJson } from "../lib/json";
import { asEnvironment, asMember, asTarget } from "../lib/parse";
import type { CouncilSave, Environment, Member, SavedEntry } from "../types";

const STORAGE_KEY = "microcouncil.saves.v2";

/** Au-delà, les sauvegardes les plus anciennes cèdent la place aux nouvelles. */
export const MAX_SAVES = 100;

/** Relit une fiche enregistrée et son emplacement, ou null si l'une des deux manque. */
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

/** Relit une sauvegarde enregistrée, ou null si elle n'a pas la forme attendue. */
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

/** La liste enregistrée, de la plus récente à la plus ancienne. */
export function readSaves(): readonly CouncilSave[] {
  return parseSaves(readJson(STORAGE_KEY));
}

export function writeSaves(saves: readonly CouncilSave[]): void {
  writeJson(STORAGE_KEY, saves);
}

/** Range par date décroissante et abandonne les plus vieilles au-delà de la limite. */
export function sortAndTrim(
  saves: readonly CouncilSave[],
): readonly CouncilSave[] {
  return [...saves].sort((a, b) => b.savedAt - a.savedAt).slice(0, MAX_SAVES);
}

/** Identifiant opaque et stable, même là où `randomUUID` n'existe pas. */
export function newSaveId(): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  return (
    uuid ??
    // Repli sans portée cryptographique : un identifiant de liste, pas un secret.
    // eslint-disable-next-line sonarjs/pseudo-random
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  );
}
