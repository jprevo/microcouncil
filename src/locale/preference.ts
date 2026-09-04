import { asString, readJson, writeJson } from "../lib/json";
import { LOCALES } from "./registry";

/**
 * Neither versioned nor per-language, unlike the state and saves keys: this is a
 * single language code shared by every page of the origin, and its meaning can't
 * drift the way a stored state's shape can.
 */
const STORAGE_KEY = "microcouncil.locale";

/**
 * The language the visitor picked by hand, or null if they never did — or if
 * they picked one the site no longer ships.
 */
export function readLocalePreference(): string | null {
  const code = asString(readJson(STORAGE_KEY));
  return LOCALES.some((locale) => locale.code === code) ? code : null;
}

/** Remembers a hand-picked language, so the next visit opens straight into it. */
export function writeLocalePreference(code: string): void {
  writeJson(STORAGE_KEY, code);
}
