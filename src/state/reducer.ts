import type { Catalog } from "../lib/library";
import type {
  AppState,
  CouncilConfig,
  Dynamic,
  DynamicLibrary,
  Library,
  LibraryTarget,
  Member,
  MemberLibrary,
} from "../types";

export type AppAction =
  | { readonly type: "username"; readonly value: string }
  | { readonly type: "members"; readonly names: readonly string[] }
  | { readonly type: "toggleMember"; readonly name: string }
  | { readonly type: "dynamic"; readonly title: string | null }
  | { readonly type: "toggleDynamic"; readonly title: string }
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
  /** A null `target` creates a new dynamic; otherwise the entry it points to is rewritten. */
  | {
      readonly type: "saveDynamic";
      readonly target: LibraryTarget | null;
      readonly dynamic: Dynamic;
    }
  | { readonly type: "deleteDynamic"; readonly target: LibraryTarget }
  | { readonly type: "restoreDynamic"; readonly target: LibraryTarget };

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
  dynamicCatalog: Catalog<Dynamic>,
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

  /** Applies a change to the group-dynamic catalog, keeping the selection in step. */
  function withDynamics(
    state: AppState,
    target: LibraryTarget | null,
    apply: (library: DynamicLibrary) => DynamicLibrary,
  ): AppState {
    const edit = applyChange(
      dynamicCatalog,
      state.dynamicLibrary,
      target,
      apply,
    );
    return {
      ...state,
      dynamicLibrary: edit.library,
      selectedDynamic: renameSelectedOne(state.selectedDynamic, edit),
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

    let dynamicLibrary = state.dynamicLibrary;
    let selectedDynamic: string | null = null;
    if (council.dynamic !== null) {
      const back = dynamicCatalog.reinstate(
        dynamicLibrary,
        council.dynamic.target,
        council.dynamic.item,
        council.dynamic.edited,
      );
      dynamicLibrary = back.library;
      selectedDynamic = back.label;
    }

    return {
      ...state,
      username: council.username,
      memberLibrary,
      dynamicLibrary,
      selectedMembers: ordered(memberLibrary, selected),
      selectedDynamic,
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
      case "dynamic":
        return { ...state, selectedDynamic: action.title };
      case "toggleDynamic":
        return {
          ...state,
          selectedDynamic:
            state.selectedDynamic === action.title ? null : action.title,
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
      case "saveDynamic":
        return withDynamics(state, action.target, (library) =>
          dynamicCatalog.save(library, action.target, action.dynamic),
        );
      case "deleteDynamic":
        return withDynamics(state, action.target, (library) =>
          dynamicCatalog.remove(library, action.target),
        );
      case "restoreDynamic":
        return withDynamics(state, action.target, (library) =>
          dynamicCatalog.restore(library, action.target),
        );
    }
  };
}
