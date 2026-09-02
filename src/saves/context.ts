import { createContext } from "react";
import type { CouncilConfig, CouncilSave } from "../types";

export interface SavesApi {
  /** Les sauvegardes, de la plus récente à la plus ancienne. */
  readonly saves: readonly CouncilSave[];
  /** Range un conseil sous ce nom, en remplaçant une éventuelle sauvegarde homonyme. */
  readonly save: (name: string, config: CouncilConfig) => void;
  readonly remove: (id: string) => void;
  /** La sauvegarde portant déjà ce nom, à la casse et aux accents près. */
  readonly findByName: (name: string) => CouncilSave | undefined;
}

export const SavesContext = createContext<SavesApi | null>(null);
