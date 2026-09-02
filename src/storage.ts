import { environmentCatalog, memberCatalog } from "./lib/catalogs";
import { asRecord, asStringArray, readJson, writeJson } from "./lib/json";
import { EMPTY_LIBRARY } from "./lib/library";
import type { Catalog } from "./lib/library";
import { asEnvironment, asMember } from "./lib/parse";
import type {
  AppState,
  EnvironmentLibrary,
  Library,
  MemberLibrary,
  Theme,
} from "./types";

const STORAGE_KEY = "microcouncil.state.v1";

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

function preferredTheme(): Theme {
  return globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches ===
    true
    ? "dark"
    : "light";
}

export function defaultState(): AppState {
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

/** Écarte les fiches illisibles, les doublons de nom et les surcharges orphelines. */
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
    for (const [name, stored] of Object.entries(storedOverrides)) {
      const item = asItem(stored);
      if (item !== null && catalog.builtinNames.has(name))
        overrides[name] = item;
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

/** Relit l'état sauvegardé en écartant tout ce qui ne correspond plus au catalogue. */
export function loadState(): AppState {
  const fallback = defaultState();
  const record = asRecord(readJson(STORAGE_KEY));
  if (record === null) return fallback;

  const memberLibrary: MemberLibrary = asLibrary(
    record["memberLibrary"],
    memberCatalog,
    asMember,
  );
  const environmentLibrary: EnvironmentLibrary = asLibrary(
    record["environmentLibrary"],
    environmentCatalog,
    asEnvironment,
  );

  const knownMembers = new Set(
    memberCatalog.build(memberLibrary).map((entry) => entry.label),
  );
  const knownEnvironments = new Set(
    environmentCatalog.build(environmentLibrary).map((entry) => entry.label),
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

export function saveState(state: AppState): void {
  writeJson(STORAGE_KEY, state);
}
