import { normalize } from "./text";
import type { CatalogEntry, Library, LibraryTarget } from "../types";

export const EMPTY_LIBRARY: Library<never> = { custom: [], overrides: {} };

/** Stable identifier of a slot: unique across renames and across both namespaces. */
export function targetKey(target: LibraryTarget): string {
  return `${target.kind}:${target.name}`;
}

export function sameTarget(a: LibraryTarget, b: LibraryTarget): boolean {
  return a.kind === b.kind && a.name === b.name;
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
  /** Reads the field an entry is named by. */
  readonly nameOf: (item: T) => string;
  /** Names of the shipped entries, used to spot orphan overrides when reloading. */
  readonly builtinNames: ReadonlySet<string>;
}

/**
 * Builds the operations of one catalog. `nameOf` reads the field an entry is named
 * by — `name` for a member, `title` for an environment — and nothing else here
 * needs to know which of the two it is working on.
 */
export function createCatalog<T>(
  builtins: readonly T[],
  nameOf: (item: T) => string,
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

  return {
    build,
    entryAt,
    takenNames,
    save,
    remove,
    restore,
    nameOf,
    builtinNames: new Set(builtins.map(nameOf)),
  };
}
