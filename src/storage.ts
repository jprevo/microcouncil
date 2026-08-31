import { ENVIRONMENTS, MEMBERS } from './data';
import { EMPTY_LIBRARY, buildCatalog } from './lib/catalog';
import type { AppState, Member, MemberLibrary, Theme } from './types';

const STORAGE_KEY = 'microcouncil.state.v1';

export const DEFAULT_RANDOM_COUNT = 4;

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

function preferredTheme(): Theme {
  return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches === true ? 'dark' : 'light';
}

export function defaultState(): AppState {
  return {
    username: '',
    selectedMembers: [],
    selectedEnvironment: null,
    customInstructions: '',
    subject: '',
    randomCount: DEFAULT_RANDOM_COUNT,
    theme: preferredTheme(),
    memberLibrary: EMPTY_LIBRARY,
  };
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/** Relit une fiche enregistrée, ou null si elle n'a pas la forme attendue. */
function asMember(value: unknown): Member | null {
  if (typeof value !== 'object' || value === null) return null;
  const record = value as Record<string, unknown>;
  const member: Member = {
    name: asString(record['name']).trim(),
    icon: asString(record['icon']).trim(),
    job: asString(record['job']).trim(),
    description: asString(record['description']).trim(),
    traits: asStringArray(record['traits']),
  };
  return member.name === '' || member.icon === '' ? null : member;
}

/** Écarte les fiches illisibles, les doublons de nom et les surcharges orphelines. */
function asLibrary(value: unknown): MemberLibrary {
  if (typeof value !== 'object' || value === null) return EMPTY_LIBRARY;
  const record = value as Record<string, unknown>;

  const overrides: Record<string, Member> = {};
  const storedOverrides = record['overrides'];
  if (typeof storedOverrides === 'object' && storedOverrides !== null) {
    const builtinNames = new Set(MEMBERS.map((member) => member.name));
    for (const [name, stored] of Object.entries(storedOverrides as Record<string, unknown>)) {
      const member = asMember(stored);
      if (member !== null && builtinNames.has(name)) overrides[name] = member;
    }
  }

  const taken = new Set(buildCatalog({ custom: [], overrides }).map((member) => member.name));
  const custom: Member[] = [];
  for (const stored of Array.isArray(record['custom']) ? record['custom'] : []) {
    const member = asMember(stored);
    if (member === null || taken.has(member.name)) continue;
    taken.add(member.name);
    custom.push(member);
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
  if (typeof parsed !== 'object' || parsed === null) return fallback;
  const record = parsed as Record<string, unknown>;

  const memberLibrary = asLibrary(record['memberLibrary']);
  const knownMembers = new Set(buildCatalog(memberLibrary).map((member) => member.name));
  const knownEnvironments = new Set(ENVIRONMENTS.map((environment) => environment.title));
  const environment = record['selectedEnvironment'];
  const count = record['randomCount'];

  return {
    username: typeof record['username'] === 'string' ? record['username'] : fallback.username,
    selectedMembers: asStringArray(record['selectedMembers']).filter((name) => knownMembers.has(name)),
    selectedEnvironment:
      typeof environment === 'string' && knownEnvironments.has(environment) ? environment : null,
    customInstructions:
      typeof record['customInstructions'] === 'string'
        ? record['customInstructions']
        : fallback.customInstructions,
    subject: typeof record['subject'] === 'string' ? record['subject'] : fallback.subject,
    randomCount:
      typeof count === 'number' && Number.isFinite(count)
        ? Math.min(Math.max(Math.round(count), 1), knownMembers.size)
        : fallback.randomCount,
    theme: isTheme(record['theme']) ? record['theme'] : fallback.theme,
    memberLibrary,
  };
}

export function saveState(state: AppState): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Mode privé ou stockage plein : l'application reste utilisable sans persistance.
  }
}
