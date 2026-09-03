import { normalize } from "./text";
import type { CatalogEntry, Library, LibraryTarget } from "../types";

export const EMPTY_LIBRARY: Library<never> = { custom: [], overrides: {} };

/** Stable identifier of a slot: unique across renames and across both namespaces. */
export function targetKey(target: LibraryTarget): string {
  return `${target.kind}:${target.name}`;
}

function sameTarget(a: LibraryTarget, b: LibraryTarget): boolean {
  return a.kind === b.kind && a.name === b.name;
}

/** The card alone, stripped of where it came from: what a library actually stores. */
export function stripOrigin<T>(entry: CatalogEntry<T>): T {
  const { label, target, edited, ...item } = entry;
  return item as T;
}

/** `base` itself when free, else the first `base (n)` no other slot lays claim to. */
function freeName(taken: ReadonlySet<string>, base: string): string {
  if (!taken.has(normalize(base))) return base;
  // Each suffix is distinct, so a free one is reached within `taken.size` tries.
  for (let n = 2; n <= taken.size + 2; n += 1) {
    const candidate = `${base} (${n})`;
    if (!taken.has(normalize(candidate))) return candidate;
  }
  return `${base} (${Date.now()})`;
}

/** A card put back into a catalog, under the name it could actually take. */
interface Reinstated<T> {
  readonly library: Library<T>;
  /** The name the card came back under — suffixed when its own was taken. */
  readonly label: string;
}

/** A shipped catalog and the operations that overlay a local library on top of it. */
export interface Catalog<T> {
  /** Shipped entries first — edits applied in place — then the ones the user created. */
  readonly build: (library: Library<T>) => readonly CatalogEntry<T>[];
  /** The entry currently filling a slot, or undefined once that slot is gone. */
  readonly entryAt: (
    library: Library<T>,
    target: LibraryTarget,
  ) => CatalogEntry<T> | undefined;
  /** Names a new or renamed entry may not take, normalized for comparison. */
  readonly takenNames: (
    library: Library<T>,
    target: LibraryTarget | null,
  ) => ReadonlySet<string>;
  /** Writes an entry into its slot; a null target creates a new custom entry. */
  readonly save: (
    library: Library<T>,
    target: LibraryTarget | null,
    item: T,
  ) => Library<T>;
  /** Removes an entry the user created. Built-ins are restored, never deleted. */
  readonly remove: (library: Library<T>, target: LibraryTarget) => Library<T>;
  /** Drops the local edit of a built-in, bringing the shipped version back. */
  readonly restore: (library: Library<T>, target: LibraryTarget) => Library<T>;
  /**
   * Writes a card back into the slot it used to fill, recreating that slot when it
   * has since disappeared. Used to reinstate the catalog a saved council was built
   * on, whatever became of it in the meantime.
   */
  readonly reinstate: (
    library: Library<T>,
    target: LibraryTarget,
    item: T,
    edited: boolean,
  ) => Reinstated<T>;
  /** Reads the field an entry is named by. */
  readonly nameOf: (item: T) => string;
  /** Names of the shipped entries, used to spot orphan overrides when reloading. */
  readonly builtinNames: ReadonlySet<string>;
}

/**
 * Builds the operations of one catalog. `nameOf` reads the field an entry is named
 * by — `name` for a member, `title` for an environment — `withName` rewrites it,
 * and nothing else here needs to know which of the two it is working on.
 */
export function createCatalog<T>(
  builtins: readonly T[],
  nameOf: (item: T) => string,
  withName: (item: T, name: string) => T,
): Catalog<T> {
  const entry = (
    item: T,
    target: LibraryTarget,
    edited: boolean,
  ): CatalogEntry<T> => ({ ...item, label: nameOf(item), target, edited });

  const build = (library: Library<T>): readonly CatalogEntry<T>[] => {
    const shipped = builtins.map((item) => {
      const name = nameOf(item);
      const override = library.overrides[name];
      return entry(
        override ?? item,
        { kind: "builtin", name },
        override !== undefined,
      );
    });
    const custom = library.custom.map((item) =>
      entry(item, { kind: "custom", name: nameOf(item) }, false),
    );
    return [...shipped, ...custom];
  };

  const entryAt = (
    library: Library<T>,
    target: LibraryTarget,
  ): CatalogEntry<T> | undefined =>
    build(library).find((candidate) => sameTarget(candidate.target, target));

  /**
   * Built-ins keep a claim on their original name even after a rename, so restoring
   * one can never collide with an entry created in the meantime.
   */
  const takenNames = (
    library: Library<T>,
    target: LibraryTarget | null,
  ): ReadonlySet<string> => {
    const taken = new Set<string>();
    for (const candidate of build(library)) {
      if (target !== null && sameTarget(candidate.target, target)) continue;
      taken.add(normalize(candidate.label));
      if (candidate.target.kind === "builtin")
        taken.add(normalize(candidate.target.name));
    }
    return taken;
  };

  const save = (
    library: Library<T>,
    target: LibraryTarget | null,
    item: T,
  ): Library<T> => {
    if (target === null) {
      return { ...library, custom: [...library.custom, item] };
    }
    if (target.kind === "builtin") {
      return {
        ...library,
        overrides: { ...library.overrides, [target.name]: item },
      };
    }
    return {
      ...library,
      custom: library.custom.map((candidate) =>
        nameOf(candidate) === target.name ? item : candidate,
      ),
    };
  };

  const remove = (library: Library<T>, target: LibraryTarget): Library<T> => {
    if (target.kind !== "custom") return library;
    return {
      ...library,
      custom: library.custom.filter(
        (candidate) => nameOf(candidate) !== target.name,
      ),
    };
  };

  const restore = (library: Library<T>, target: LibraryTarget): Library<T> => {
    if (target.kind !== "builtin" || !(target.name in library.overrides))
      return library;
    const overrides = { ...library.overrides };
    delete overrides[target.name];
    return { ...library, overrides };
  };

  /**
   * A slot survives as long as `entryAt` still finds it — always, for a shipped
   * built-in. Once it is gone the card comes back as a new custom entry, which is
   * also what happens to a built-in dropped from a later version of the catalog.
   */
  const reinstate = (
    library: Library<T>,
    target: LibraryTarget,
    item: T,
    edited: boolean,
  ): Reinstated<T> => {
    const slot = entryAt(library, target) === undefined ? null : target;

    // An untouched built-in comes back by dropping the override. Its shipped name is
    // always available: `takenNames` reserves that name for the built-in as long as it
    // exists, so putting the card back can never collide.
    if (slot !== null && slot.kind === "builtin" && !edited) {
      const next = restore(library, slot);
      const back = entryAt(next, slot);
      if (back !== undefined) return { library: next, label: back.label };
    }

    const label = freeName(takenNames(library, slot), nameOf(item));
    return { library: save(library, slot, withName(item, label)), label };
  };

  return {
    build,
    entryAt,
    takenNames,
    save,
    remove,
    restore,
    reinstate,
    nameOf,
    builtinNames: new Set(builtins.map(nameOf)),
  };
}
