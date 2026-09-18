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
  const { bundle, memberCatalog, dynamicCatalog } = useLocale();
  const locale = bundle.meta.code;
  const catalogs = useMemo(
    () => ({ memberCatalog, dynamicCatalog }),
    [memberCatalog, dynamicCatalog],
  );
  const reducer = useMemo(
    () => createReducer(memberCatalog, dynamicCatalog),
    [memberCatalog, dynamicCatalog],
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
