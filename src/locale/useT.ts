import { useLocale } from "./useLocale";
import type { UiStrings } from "./types";

/** Shorthand for the active locale's interface strings. */
export function useT(): UiStrings {
  return useLocale().bundle.ui;
}
