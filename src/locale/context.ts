import { createContext } from "react";
import type { Catalogs } from "../lib/catalogs";
import type { LocaleBundle } from "./types";

export interface LocaleApi extends Catalogs {
  readonly bundle: LocaleBundle;
}

export const LocaleContext = createContext<LocaleApi | null>(null);
