export interface Member {
  readonly name: string;
  readonly icon: string;
  readonly job: string;
  readonly description: string;
  readonly traits: readonly string[];
  /** Mots-clés de recherche : jamais affichés dans le prompt, seulement indexés. */
  readonly tags: readonly string[];
}

/**
 * The catalog slot an edit writes into. It never changes when a member is renamed,
 * so a built-in stays recognizable — and restorable — whatever the user calls it.
 */
export type MemberTarget =
  | { readonly kind: "builtin"; readonly name: string }
  | { readonly kind: "custom"; readonly name: string };

/** Everything the user added to, or changed in, the shipped catalog. */
export interface MemberLibrary {
  /** Members created by the user, in creation order. */
  readonly custom: readonly Member[];
  /** Rewritten built-ins, keyed by the name of the built-in they replace. */
  readonly overrides: Readonly<Record<string, Member>>;
}

/** A member as the interface shows it: its content, plus where it comes from. */
export interface CatalogMember extends Member {
  readonly target: MemberTarget;
  /** True for a built-in carrying a local edit, which can therefore be reverted. */
  readonly edited: boolean;
}

export interface Environment {
  readonly title: string;
  readonly icon: string;
  readonly summary: string;
  readonly description: string;
}

export type Theme = "light" | "dark";

export interface AppState {
  username: string;
  /** Noms des membres sélectionnés, dans l'ordre du catalogue. */
  selectedMembers: string[];
  /** Titre de l'environnement sélectionné, ou null. */
  selectedEnvironment: string | null;
  customInstructions: string;
  subject: string;
  theme: Theme;
  /** Membres ajoutés ou modifiés localement, superposés au catalogue livré. */
  memberLibrary: MemberLibrary;
}
