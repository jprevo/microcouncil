import { MEMBERS } from '../data';
import type { AppState } from '../types';

export type AppAction =
  | { readonly type: 'username'; readonly value: string }
  | { readonly type: 'members'; readonly names: readonly string[] }
  | { readonly type: 'toggleMember'; readonly name: string }
  | { readonly type: 'environment'; readonly title: string | null }
  | { readonly type: 'toggleEnvironment'; readonly title: string }
  | { readonly type: 'custom'; readonly value: string }
  | { readonly type: 'subject'; readonly value: string }
  | { readonly type: 'randomCount'; readonly value: number }
  | { readonly type: 'nudgeCount'; readonly delta: number }
  | { readonly type: 'toggleTheme' };

export function clampCount(value: number): number {
  return Math.min(Math.max(Math.round(value), 1), MEMBERS.length);
}

/** Sélection triée selon l'ordre du catalogue, pour un prompt stable. */
function ordered(names: readonly string[]): string[] {
  return MEMBERS.map((member) => member.name).filter((name) => names.includes(name));
}

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'username':
      return { ...state, username: action.value };
    case 'members':
      return { ...state, selectedMembers: ordered(action.names) };
    case 'toggleMember':
      return {
        ...state,
        selectedMembers: ordered(
          state.selectedMembers.includes(action.name)
            ? state.selectedMembers.filter((name) => name !== action.name)
            : [...state.selectedMembers, action.name],
        ),
      };
    case 'environment':
      return { ...state, selectedEnvironment: action.title };
    case 'toggleEnvironment':
      return {
        ...state,
        selectedEnvironment: state.selectedEnvironment === action.title ? null : action.title,
      };
    case 'custom':
      return { ...state, customInstructions: action.value };
    case 'subject':
      return { ...state, subject: action.value };
    case 'randomCount':
      return { ...state, randomCount: clampCount(action.value) };
    case 'nudgeCount':
      return { ...state, randomCount: clampCount(state.randomCount + action.delta) };
    case 'toggleTheme':
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
  }
}
