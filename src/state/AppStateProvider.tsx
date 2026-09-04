import { useEffect, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import { loadState, saveState } from "../storage";
import { DispatchContext, StateContext } from "./contexts";
import { createReducer } from "./reducer";
import { useLocale } from "../locale/useLocale";

export function AppStateProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const { bundle, memberCatalog, environmentCatalog } = useLocale();
  const locale = bundle.meta.code;
  const catalogs = useMemo(
    () => ({ memberCatalog, environmentCatalog }),
    [memberCatalog, environmentCatalog],
  );
  const reducer = useMemo(
    () => createReducer(memberCatalog, environmentCatalog),
    [memberCatalog, environmentCatalog],
  );
  const [state, dispatch] = useReducer(reducer, null, () =>
    loadState(locale, catalogs),
  );

  useEffect(() => {
    saveState(locale, state);
  }, [locale, state]);

  return (
    <StateContext value={state}>
      <DispatchContext value={dispatch}>{children}</DispatchContext>
    </StateContext>
  );
}
