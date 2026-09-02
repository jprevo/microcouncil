import { environmentCatalog, memberCatalog } from "./lib/catalogs";
import { EMPTY_LIBRARY } from "./lib/library";
import type { Catalog } from "./lib/library";
import type {
  AppState,
  Environment,
  EnvironmentLibrary,
  Library,
  Member,
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

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) return null;
  return value as Record<string, unknown>;
}

/** Relit une fiche de membre enregistrée, ou null si elle n'a pas la forme attendue. */
function asMember(value: unknown): Member | null {
  const record = asRecord(value);
  if (record === null) return null;
  const member: Member = {
    name: asString(record["name"]).trim(),
    icon: asString(record["icon"]).trim(),
    job: asString(record["job"]).trim(),
    description: asString(record["description"]).trim(),
    traits: asStringArray(record["traits"]),
    tags: asStringArray(record["tags"]),
  };
  return member.name === "" || member.icon === "" ? null : member;
}

/** Relit un environnement enregistré, ou null s'il n'a pas la forme attendue. */
function asEnvironment(value: unknown): Environment | null {
  const record = asRecord(value);
  if (record === null) return null;
  const environment: Environment = {
    title: asString(record["title"]).trim(),
    icon: asString(record["icon"]).trim(),
    summary: asString(record["summary"]).trim(),
    description: asString(record["description"]).trim(),
  };
  return environment.title === "" || environment.icon === ""
    ? null
    : environment;
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
  let raw: string | null = null;
  try {
    raw = globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
  } catch {
    return fallback;
  }
  if (raw === null) return fallback;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return fallback;
  }
  const record = asRecord(parsed);
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
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Mode privé ou stockage plein : l'application reste utilisable sans persistance.
  }
}
