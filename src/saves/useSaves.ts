import { useContext } from "react";
import { SavesContext } from "./context";
import type { SavesApi } from "./context";

export function useSaves(): SavesApi {
  const api = useContext(SavesContext);
  if (api === null)
    throw new Error("useSaves must be used inside <SavesProvider>.");
  return api;
}
