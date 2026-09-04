import { useMemo } from "react";
import type { ReactNode } from "react";
import { LocaleContext } from "./context";
import type { LocaleApi } from "./context";
import type { LocaleBundle } from "./types";
import { createCatalogs } from "../lib/catalogs";

interface LocaleProviderProps {
  readonly bundle: LocaleBundle;
  readonly children: ReactNode;
}

/**
 * The root of the locale-dependent world: one language's content and the
 * catalogs built from it. Everything downstream — state, storage, prompt
 * rendering, every piece of UI copy — reads from here instead of a fixed import,
 * so the exact same component tree serves any page this app is compiled for.
 */
export function LocaleProvider({ bundle, children }: LocaleProviderProps) {
  const api = useMemo<LocaleApi>(
    () => ({ bundle, ...createCatalogs(bundle) }),
    [bundle],
  );

  return <LocaleContext value={api}>{children}</LocaleContext>;
}
