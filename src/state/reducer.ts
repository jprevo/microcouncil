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
  /** Replaces the whole state, as an imported backup does. */
  | { readonly type: "replaceState"; readonly state: AppState }
  /** Replays a saved council over the current state, leaving the catalog alone. */
  | { readonly type: "loadCouncil"; readonly council: CouncilConfig }
  /** A null `target` creates a new member; otherwise the entry it points to is rewritten. */
  | {
      readonly type: "saveMember";
      readonly target: LibraryTarget | null;
      readonly member: Member;
    }
  | { readonly type: "deleteMember"; readonly target: LibraryTarget }
  | { readonly type: "restoreMember"; readonly target: LibraryTarget }
  /** A null `target` creates a new setting; otherwise the entry it points to is rewritten. */
  | {
      readonly type: "saveEnvironment";
      readonly target: LibraryTarget | null;
      readonly environment: Environment;
    }
  | { readonly type: "deleteEnvironment"; readonly target: LibraryTarget }
  | { readonly type: "restoreEnvironment"; readonly target: LibraryTarget };

/** The name an entry carried before, then after, a change to the library. */
interface Rename {
  /** Absent on a creation: no existing entry is being targeted. */
  readonly before: string | undefined;
  /** Null once the targeted entry is gone. */
  readonly after: string | null;
}

interface LibraryChange<T> extends Rename {
  readonly library: Library<T>;
}

/** Applies a library change, noting the name before and the name after. */
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

/** A renamed entry stays selected; one that disappeared drops out of the selection. */
function renameSelected(
  names: readonly string[],
  { before, after }: Rename,
): string[] {
  if (before === undefined || before === after) return [...names];
  const without = names.filter((name) => name !== before);
  if (after === null || !names.includes(before)) return without;
  return [...without, after];
}

/** The same rule, for a single-value selection. */
function renameSelectedOne(
  selected: string | null,
  { before, after }: Rename,
): string | null {
  if (before === undefined || selected !== before) return selected;
  return after;
}

/**
 * The reducer's transitions, bound to the two catalogs of one locale. Built once
 * per active language (`createCatalogs(bundle)`), since every catalog lookup here
 * — ordering the selection, following a rename, reinstating a saved council — has
 * to run against that language's shipped entries.
 */
export function createReducer(
  memberCatalog: Catalog<Member>,
  environmentCatalog: Catalog<Environment>,
): (state: AppState, action: AppAction) => AppState {
  /** The selection sorted into catalog order, so the prompt stays stable. */
  function ordered(library: MemberLibrary, names: readonly string[]): string[] {
    return memberCatalog
      .build(library)
      .map((member) => member.label)
      .filter((name) => names.includes(name));
  }

  /** Applies a change to the member catalog, realigning the selection with it. */
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

  /** Applies a change to the setting catalog, keeping the selection in step. */
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
   * Restores a saved council. Every entry is written back into the slot it filled:
   * one renamed or rewritten since gets its old version back, one deleted since
   * reappears in the catalog. The council therefore comes back exactly as it was,
   * whatever happened to the catalog in the meantime.
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

  return function reducer(state: AppState, action: AppAction): AppState {
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
      case "replaceState":
        return action.state;
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
  };
}
