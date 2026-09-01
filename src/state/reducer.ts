import {
  buildCatalog,
  deleteMember,
  memberAt,
  restoreMember,
  saveMember,
} from "../lib/catalog";
import type { AppState, Member, MemberLibrary, MemberTarget } from "../types";

export type AppAction =
  | { readonly type: "username"; readonly value: string }
  | { readonly type: "members"; readonly names: readonly string[] }
  | { readonly type: "toggleMember"; readonly name: string }
  | { readonly type: "environment"; readonly title: string | null }
  | { readonly type: "toggleEnvironment"; readonly title: string }
  | { readonly type: "custom"; readonly value: string }
  | { readonly type: "subject"; readonly value: string }
  | { readonly type: "randomCount"; readonly value: number }
  | { readonly type: "nudgeCount"; readonly delta: number }
  | { readonly type: "toggleTheme" }
  /** Un `target` nul crée un nouveau membre ; sinon la fiche visée est réécrite. */
  | {
      readonly type: "saveMember";
      readonly target: MemberTarget | null;
      readonly member: Member;
    }
  | { readonly type: "deleteMember"; readonly target: MemberTarget }
  | { readonly type: "restoreMember"; readonly target: MemberTarget };

export function clampCount(value: number, catalogSize: number): number {
  return Math.min(Math.max(Math.round(value), 1), Math.max(catalogSize, 1));
}

function catalogNames(library: MemberLibrary): readonly string[] {
  return buildCatalog(library).map((member) => member.name);
}

/** Sélection triée selon l'ordre du catalogue, pour un prompt stable. */
function ordered(library: MemberLibrary, names: readonly string[]): string[] {
  return catalogNames(library).filter((name) => names.includes(name));
}

/** Une fiche renommée reste sélectionnée ; une fiche disparue quitte la sélection. */
function rename(
  names: readonly string[],
  before: string | undefined,
  after: string | null,
): string[] {
  if (before === undefined || before === after) return [...names];
  const without = names.filter((name) => name !== before);
  if (after === null || !names.includes(before)) return without;
  return [...without, after];
}

/** Applique un changement de catalogue en réalignant la sélection et le tirage au sort. */
function withLibrary(
  state: AppState,
  library: MemberLibrary,
  selected: readonly string[],
): AppState {
  return {
    ...state,
    memberLibrary: library,
    selectedMembers: ordered(library, selected),
    randomCount: clampCount(state.randomCount, catalogNames(library).length),
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
    case "randomCount":
      return {
        ...state,
        randomCount: clampCount(
          action.value,
          catalogNames(state.memberLibrary).length,
        ),
      };
    case "nudgeCount":
      return {
        ...state,
        randomCount: clampCount(
          state.randomCount + action.delta,
          catalogNames(state.memberLibrary).length,
        ),
      };
    case "toggleTheme":
      return { ...state, theme: state.theme === "dark" ? "light" : "dark" };
    case "saveMember": {
      const previous =
        action.target === null
          ? undefined
          : memberAt(state.memberLibrary, action.target)?.name;
      const library = saveMember(
        state.memberLibrary,
        action.target,
        action.member,
      );
      return withLibrary(
        state,
        library,
        rename(state.selectedMembers, previous, action.member.name),
      );
    }
    case "deleteMember": {
      const previous = memberAt(state.memberLibrary, action.target)?.name;
      const library = deleteMember(state.memberLibrary, action.target);
      return withLibrary(
        state,
        library,
        rename(state.selectedMembers, previous, null),
      );
    }
    case "restoreMember": {
      const previous = memberAt(state.memberLibrary, action.target)?.name;
      const library = restoreMember(state.memberLibrary, action.target);
      const restored = memberAt(library, action.target)?.name ?? null;
      return withLibrary(
        state,
        library,
        rename(state.selectedMembers, previous, restored),
      );
    }
  }
}
