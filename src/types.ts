export interface Member {
  readonly name: string;
  readonly icon: string;
  readonly job: string;
  readonly description: string;
  readonly traits: readonly string[];
  /** Search keywords: indexed only, never shown in the prompt. */
  readonly tags: readonly string[];
}

export interface Environment {
  readonly title: string;
  readonly icon: string;
  readonly summary: string;
  readonly description: string;
}

/**
 * The catalog slot an edit writes into. A built-in is addressed by its stable,
 * locale-independent `id` — never by its (translated, renamable) display name — so
 * it stays recognizable and restorable whatever the user calls it and whatever
 * language the page is in. A custom entry has no such id, so its current name is
 * the only handle available.
 */
export type LibraryTarget =
  | { readonly kind: "builtin"; readonly id: string }
  | { readonly kind: "custom"; readonly name: string };

/** Everything the user added to, or changed in, one of the shipped catalogs. */
export interface Library<T> {
  /** Entries created by the user, in creation order. */
  readonly custom: readonly T[];
  /** Rewritten built-ins, keyed by the name of the built-in they replace. */
  readonly overrides: Readonly<Record<string, T>>;
}

/** Where a displayed entry comes from, whatever the field carrying its name. */
export interface CatalogOrigin {
  /** The entry's current name — `name` for a member, `title` for an environment. */
  readonly label: string;
  readonly target: LibraryTarget;
  /** True for a built-in carrying a local edit, which can therefore be reverted. */
  readonly edited: boolean;
}

/** An entry as the interface shows it: its content, plus where it comes from. */
export type CatalogEntry<T> = T & CatalogOrigin;

export type MemberLibrary = Library<Member>;
export type CatalogMember = CatalogEntry<Member>;

export type EnvironmentLibrary = Library<Environment>;
export type CatalogEnvironment = CatalogEntry<Environment>;

export type Theme = "light" | "dark";

export interface AppState {
  username: string;
  /** Names of the selected members, in catalog order. */
  selectedMembers: string[];
  /** Title of the selected setting, or null when none is picked. */
  selectedEnvironment: string | null;
  customInstructions: string;
  subject: string;
  theme: Theme;
  /** Locally added or edited members, layered over the shipped catalog. */
  memberLibrary: MemberLibrary;
  /** Locally added or edited settings, layered over the shipped catalog. */
  environmentLibrary: EnvironmentLibrary;
}

/**
 * An entry as it stood when the council was saved, together with the slot it
 * occupied. The name alone would not be enough: an entry renamed, rewritten or
 * deleted since would come back missing from the council.
 */
export interface SavedEntry<T> {
  readonly target: LibraryTarget;
  readonly item: T;
  /**
   * True when the entry carried a local edit. An untouched built-in is restored
   * by dropping the override instead, otherwise the catalog would fill up with
   * identical copies all flagged as edited.
   */
  readonly edited: boolean;
}

/**
 * What a save restores: the council, plus the entries it is built on. The theme
 * is a display preference and deliberately stays behind.
 */
export interface CouncilConfig {
  readonly username: string;
  readonly members: readonly SavedEntry<Member>[];
  readonly environment: SavedEntry<Environment> | null;
  readonly customInstructions: string;
  readonly subject: string;
}

/** A council kept in storage, under the name the user gave it. */
export interface CouncilSave extends CouncilConfig {
  readonly id: string;
  readonly name: string;
  /** When it was saved: orders the list, and identifies the oldest save. */
  readonly savedAt: number;
}
