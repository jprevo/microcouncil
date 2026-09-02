import { environmentCatalog, memberCatalog } from "../lib/catalogs";
import type { Catalog } from "../lib/library";
import type {
  AppState,
  CouncilConfig,
  Environment,
  EnvironmentLibrary,
  Library,
  LibraryTarget,
  Member,
  MemberLibrary,
} from "../types";

export type AppAction =
  | { readonly type: "username"; readonly value: string }
  | { readonly type: "members"; readonly names: readonly string[] }
  | { readonly type: "toggleMember"; readonly name: string }
  | { readonly type: "environment"; readonly title: string | null }
  | { readonly type: "toggleEnvironment"; readonly title: string }
  | { readonly type: "custom"; readonly value: string }
  | { readonly type: "subject"; readonly value: string }
  | { readonly type: "toggleTheme" }
  /** Rejoue un conseil enregistré par-dessus l'état courant, sans toucher au catalogue. */
  | { readonly type: "loadCouncil"; readonly council: CouncilConfig }
  /** Un `target` nul crée un nouveau membre ; sinon la fiche visée est réécrite. */
  | {
      readonly type: "saveMember";
      readonly target: LibraryTarget | null;
      readonly member: Member;
    }
  | { readonly type: "deleteMember"; readonly target: LibraryTarget }
  | { readonly type: "restoreMember"; readonly target: LibraryTarget }
  /** Un `target` nul crée un nouvel environnement ; sinon la fiche visée est réécrite. */
  | {
      readonly type: "saveEnvironment";
      readonly target: LibraryTarget | null;
      readonly environment: Environment;
    }
  | { readonly type: "deleteEnvironment"; readonly target: LibraryTarget }
  | { readonly type: "restoreEnvironment"; readonly target: LibraryTarget };

/** Le nom porté par une fiche avant, puis après, un changement de bibliothèque. */
interface Rename {
  /** Absent lors d'une création : aucune fiche existante n'est visée. */
  readonly before: string | undefined;
  /** Null lorsque la fiche visée a disparu. */
  readonly after: string | null;
}

interface LibraryChange<T> extends Rename {
  readonly library: Library<T>;
}

/** Rejoue un changement de bibliothèque en relevant le nom d'avant et celui d'après. */
function applyChange<T>(
  catalog: Catalog<T>,
  library: Library<T>,
  target: LibraryTarget | null,
  apply: (library: Library<T>) => Library<T>,
): LibraryChange<T> {
  const next = apply(library);
  if (target === null) return { library: next, before: undefined, after: null };
  return {
    library: next,
    before: catalog.entryAt(library, target)?.label,
    after: catalog.entryAt(next, target)?.label ?? null,
  };
}

/** Sélection triée selon l'ordre du catalogue, pour un prompt stable. */
function ordered(library: MemberLibrary, names: readonly string[]): string[] {
  return memberCatalog
    .build(library)
    .map((member) => member.label)
    .filter((name) => names.includes(name));
}

/** Une fiche renommée reste sélectionnée ; une fiche disparue quitte la sélection. */
function renameSelected(
  names: readonly string[],
  { before, after }: Rename,
): string[] {
  if (before === undefined || before === after) return [...names];
  const without = names.filter((name) => name !== before);
  if (after === null || !names.includes(before)) return without;
  return [...without, after];
}

/** La même règle, pour une sélection unique. */
function renameSelectedOne(
  selected: string | null,
  { before, after }: Rename,
): string | null {
  if (before === undefined || selected !== before) return selected;
  return after;
}

/** Applique un changement au catalogue des membres en réalignant la sélection. */
function withMembers(
  state: AppState,
  target: LibraryTarget | null,
  apply: (library: MemberLibrary) => MemberLibrary,
): AppState {
  const edit = applyChange(memberCatalog, state.memberLibrary, target, apply);
  return {
    ...state,
    memberLibrary: edit.library,
    selectedMembers: ordered(
      edit.library,
      renameSelected(state.selectedMembers, edit),
    ),
  };
}

/** Applique un changement au catalogue des environnements en suivant la sélection. */
function withEnvironments(
  state: AppState,
  target: LibraryTarget | null,
  apply: (library: EnvironmentLibrary) => EnvironmentLibrary,
): AppState {
  const edit = applyChange(
    environmentCatalog,
    state.environmentLibrary,
    target,
    apply,
  );
  return {
    ...state,
    environmentLibrary: edit.library,
    selectedEnvironment: renameSelectedOne(state.selectedEnvironment, edit),
  };
}

/**
 * Restitue un conseil enregistré. Chaque fiche est réécrite dans l'emplacement
 * qu'elle occupait : une fiche renommée ou réécrite depuis reprend sa version
 * d'alors, une fiche supprimée revient dans le catalogue. Le conseil est donc
 * rendu tel qu'il était, quoi qu'il soit advenu du catalogue entre-temps.
 */
function loadCouncil(state: AppState, council: CouncilConfig): AppState {
  let memberLibrary = state.memberLibrary;
  const selected: string[] = [];
  for (const { target, item, edited } of council.members) {
    const back = memberCatalog.reinstate(memberLibrary, target, item, edited);
    memberLibrary = back.library;
    selected.push(back.label);
  }

  let environmentLibrary = state.environmentLibrary;
  let selectedEnvironment: string | null = null;
  if (council.environment !== null) {
    const back = environmentCatalog.reinstate(
      environmentLibrary,
      council.environment.target,
      council.environment.item,
      council.environment.edited,
    );
    environmentLibrary = back.library;
    selectedEnvironment = back.label;
  }

  return {
    ...state,
    username: council.username,
    memberLibrary,
    environmentLibrary,
    selectedMembers: ordered(memberLibrary, selected),
    selectedEnvironment,
    customInstructions: council.customInstructions,
    subject: council.subject,
  };
}

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "username":
      return { ...state, username: action.value };
    case "members":
      return {
        ...state,
        selectedMembers: ordered(state.memberLibrary, action.names),
      };
    case "toggleMember":
      return {
        ...state,
        selectedMembers: ordered(
          state.memberLibrary,
          state.selectedMembers.includes(action.name)
            ? state.selectedMembers.filter((name) => name !== action.name)
            : [...state.selectedMembers, action.name],
        ),
      };
    case "environment":
      return { ...state, selectedEnvironment: action.title };
    case "toggleEnvironment":
      return {
        ...state,
        selectedEnvironment:
          state.selectedEnvironment === action.title ? null : action.title,
      };
    case "custom":
      return { ...state, customInstructions: action.value };
    case "subject":
      return { ...state, subject: action.value };
    case "toggleTheme":
      return { ...state, theme: state.theme === "dark" ? "light" : "dark" };
    case "loadCouncil":
      return loadCouncil(state, action.council);
    case "saveMember":
      return withMembers(state, action.target, (library) =>
        memberCatalog.save(library, action.target, action.member),
      );
    case "deleteMember":
      return withMembers(state, action.target, (library) =>
        memberCatalog.remove(library, action.target),
      );
    case "restoreMember":
      return withMembers(state, action.target, (library) =>
        memberCatalog.restore(library, action.target),
      );
    case "saveEnvironment":
      return withEnvironments(state, action.target, (library) =>
        environmentCatalog.save(library, action.target, action.environment),
      );
    case "deleteEnvironment":
      return withEnvironments(state, action.target, (library) =>
        environmentCatalog.remove(library, action.target),
      );
    case "restoreEnvironment":
      return withEnvironments(state, action.target, (library) =>
        environmentCatalog.restore(library, action.target),
      );
  }
}
