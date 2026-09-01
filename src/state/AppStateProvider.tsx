import { useEffect, useReducer } from "react";
import type { ReactNode } from "react";
import { loadState, saveState } from "../storage";
import { DispatchContext, StateContext } from "./contexts";
import { reducer } from "./reducer";

export function AppStateProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <StateContext value={state}>
      <DispatchContext value={dispatch}>{children}</DispatchContext>
    </StateContext>
  );
}
