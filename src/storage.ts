import { asRecord, asStringArray, readJson, writeJson } from "./lib/json";
import { EMPTY_LIBRARY } from "./lib/library";
import type { Catalog } from "./lib/library";
import type { Catalogs } from "./lib/catalogs";
import { asEnvironment, asMember } from "./lib/parse";
import type {
  AppState,
  EnvironmentLibrary,
  Library,
  MemberLibrary,
  Theme,
} from "./types";

const STORAGE_VERSION = "v2";

/**
 * One storage key per language: a French-only override of "Naomi" and an
 * English-only override of "Naomi" would otherwise collide in the same
 * `localStorage`, since every page of this app shares one browser origin.
 */
function storageKey(locale: string): string {
  return `microcouncil.state.${locale}.${STORAGE_VERSION}`;
}

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

function preferredTheme(): Theme {
  return globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches ===
    true
    ? "dark"
    : "light";
}

function defaultState(): AppState {
  return {
    username: "",
    selectedMembers: [],
    selectedEnvironment: null,
    customInstructions: "",
    subject: "",
    theme: preferredTheme(),
    memberLibrary: EMPTY_LIBRARY,
    environmentLibrary: EMPTY_LIBRARY,
  };
}

/** Discards unreadable entries, duplicate names, and overrides with no built-in left. */
function asLibrary<T>(
  value: unknown,
  catalog: Catalog<T>,
  asItem: (value: unknown) => T | null,
): Library<T> {
  const record = asRecord(value);
  if (record === null) return EMPTY_LIBRARY;

  const overrides: Record<string, T> = {};
  const storedOverrides = asRecord(record["overrides"]);
  if (storedOverrides !== null) {
    for (const [id, stored] of Object.entries(storedOverrides)) {
      const item = asItem(stored);
      if (item !== null && catalog.builtinIds.has(id)) overrides[id] = item;
    }
  }

  const taken = new Set(
    catalog.build({ custom: [], overrides }).map((entry) => entry.label),
  );
  const custom: T[] = [];
  for (const stored of Array.isArray(record["custom"])
    ? record["custom"]
    : []) {
    const item = asItem(stored);
    if (item === null) continue;
    const name = catalog.nameOf(item);
    if (taken.has(name)) continue;
    taken.add(name);
    custom.push(item);
  }

  return { custom, overrides };
}

/** Reads a stored state back, dropping whatever no longer matches the catalogs. */
export function parseState(value: unknown, catalogs: Catalogs): AppState {
  const fallback = defaultState();
  const record = asRecord(value);
  if (record === null) return fallback;

  const memberLibrary: MemberLibrary = asLibrary(
    record["memberLibrary"],
    catalogs.memberCatalog,
    asMember,
  );
  const environmentLibrary: EnvironmentLibrary = asLibrary(
    record["environmentLibrary"],
    catalogs.environmentCatalog,
    asEnvironment,
  );

  const knownMembers = new Set(
    catalogs.memberCatalog.build(memberLibrary).map((entry) => entry.label),
  );
  const knownEnvironments = new Set(
    catalogs.environmentCatalog
      .build(environmentLibrary)
      .map((entry) => entry.label),
  );
  const environment = record["selectedEnvironment"];

  return {
    username:
      typeof record["username"] === "string"
        ? record["username"]
        : fallback.username,
    selectedMembers: asStringArray(record["selectedMembers"]).filter((name) =>
      knownMembers.has(name),
    ),
    selectedEnvironment:
      typeof environment === "string" && knownEnvironments.has(environment)
        ? environment
        : null,
    customInstructions:
      typeof record["customInstructions"] === "string"
        ? record["customInstructions"]
        : fallback.customInstructions,
    subject:
      typeof record["subject"] === "string"
        ? record["subject"]
        : fallback.subject,
    theme: isTheme(record["theme"]) ? record["theme"] : fallback.theme,
    memberLibrary,
    environmentLibrary,
  };
}

export function loadState(locale: string, catalogs: Catalogs): AppState {
  return parseState(readJson(storageKey(locale)), catalogs);
}

export function saveState(locale: string, state: AppState): void {
  writeJson(storageKey(locale), state);
}
