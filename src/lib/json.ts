/** Lectures défensives d'un JSON relu depuis le stockage : jamais d'exception, jamais de `any`. */

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) return null;
  return value as Record<string, unknown>;
}

export function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Relit une valeur du stockage local, ou null si elle est absente ou illisible. */
export function readJson(key: string): unknown {
  let raw: string | null;
  try {
    raw = globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Écrit dans le stockage local. Un échec — mode privé, quota — reste sans effet. */
export function writeJson(key: string, value: unknown): void {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
  } catch {
    // Mode privé ou stockage plein : l'application reste utilisable sans persistance.
  }
}
