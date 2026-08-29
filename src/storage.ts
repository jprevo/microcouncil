import { ENVIRONMENTS, MEMBERS, CUSTOM_EXAMPLE } from './data';
import type { AppState, Theme } from './types';

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
    customInstructions: CUSTOM_EXAMPLE,
    randomCount: DEFAULT_RANDOM_COUNT,
    theme: preferredTheme(),
  };
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
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

  const knownMembers = new Set(MEMBERS.map((member) => member.name));
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
    randomCount:
      typeof count === 'number' && Number.isFinite(count)
        ? Math.min(Math.max(Math.round(count), 1), MEMBERS.length)
        : fallback.randomCount,
    theme: isTheme(record['theme']) ? record['theme'] : fallback.theme,
  };
}

export function saveState(state: AppState): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Mode privé ou stockage plein : l'application reste utilisable sans persistance.
  }
}
