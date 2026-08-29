export interface Member {
  readonly name: string;
  readonly icon: string;
  readonly job: string;
  readonly description: string;
  readonly traits: readonly string[];
}

export interface Environment {
  readonly title: string;
  readonly icon: string;
  readonly description: string;
}

export type Theme = 'light' | 'dark';

export interface AppState {
  username: string;
  /** Noms des membres sélectionnés, dans l'ordre du catalogue. */
  selectedMembers: string[];
  /** Titre de l'environnement sélectionné, ou null. */
  selectedEnvironment: string | null;
  customInstructions: string;
  randomCount: number;
  theme: Theme;
}
