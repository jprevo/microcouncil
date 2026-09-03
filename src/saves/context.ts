import { createContext } from "react";
import type { CouncilConfig, CouncilSave } from "../types";

export interface SavesApi {
  /** The saved councils, newest first. */
  readonly saves: readonly CouncilSave[];
  /** Stores a council under this name, replacing any save that already goes by it. */
  readonly save: (name: string, config: CouncilConfig) => void;
  readonly remove: (id: string) => void;
  /** Drops every saved council for the given list, as an imported backup does. */
  readonly replaceAll: (saves: readonly CouncilSave[]) => void;
  /** The save already using this name, ignoring case and accents. */
  readonly findByName: (name: string) => CouncilSave | undefined;
}

export const SavesContext = createContext<SavesApi | null>(null);
