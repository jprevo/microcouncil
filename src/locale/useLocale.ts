import { useContext } from "react";
import { LocaleContext } from "./context";
import type { LocaleApi } from "./context";

export function useLocale(): LocaleApi {
  const api = useContext(LocaleContext);
  if (api === null)
    throw new Error("useLocale must be used inside <LocaleProvider>.");
  return api;
}
