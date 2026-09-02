export interface Member {
  readonly name: string;
  readonly icon: string;
  readonly job: string;
  readonly description: string;
  readonly traits: readonly string[];
  /** Mots-clés de recherche : jamais affichés dans le prompt, seulement indexés. */
  readonly tags: readonly string[];
}

export interface Environment {
  readonly title: string;
  readonly icon: string;
  readonly summary: string;
  readonly description: string;
}

/**
 * The catalog slot an edit writes into. It never changes when an entry is renamed,
 * so a built-in stays recognizable — and restorable — whatever the user calls it.
 */
export type LibraryTarget =
  | { readonly kind: "builtin"; readonly name: string }
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
  /** Noms des membres sélectionnés, dans l'ordre du catalogue. */
  selectedMembers: string[];
  /** Titre de l'environnement sélectionné, ou null. */
  selectedEnvironment: string | null;
  customInstructions: string;
  subject: string;
  theme: Theme;
  /** Membres ajoutés ou modifiés localement, superposés au catalogue livré. */
  memberLibrary: MemberLibrary;
  /** Environnements ajoutés ou modifiés localement, superposés au catalogue livré. */
  environmentLibrary: EnvironmentLibrary;
}

/**
 * Une fiche telle qu'elle était à l'enregistrement, avec l'emplacement qu'elle
 * occupait. Le nom seul ne suffirait pas : une fiche renommée, réécrite ou
 * supprimée depuis laisserait le conseil amputé.
 */
export interface SavedEntry<T> {
  readonly target: LibraryTarget;
  readonly item: T;
  /**
   * Vrai si la fiche portait une retouche locale. Une fiche livrée intacte se
   * rétablit en retirant la surcharge, sans quoi le catalogue se remplirait de
   * copies conformes marquées « modifié ».
   */
  readonly edited: boolean;
}

/**
 * Ce qu'une sauvegarde restitue : le conseil et les fiches sur lesquelles il est
 * bâti. Le thème, lui, est un réglage d'affichage et ne voyage pas.
 */
export interface CouncilConfig {
  readonly username: string;
  readonly members: readonly SavedEntry<Member>[];
  readonly environment: SavedEntry<Environment> | null;
  readonly customInstructions: string;
  readonly subject: string;
}

/** Un conseil rangé en mémoire, sous le nom que l'utilisateur lui a donné. */
export interface CouncilSave extends CouncilConfig {
  readonly id: string;
  readonly name: string;
  /** Horodatage de l'enregistrement, qui classe la liste et désigne la plus vieille. */
  readonly savedAt: number;
}
