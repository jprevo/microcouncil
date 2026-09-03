import { createContext } from "react";
import type { Dispatch } from "react";
import type { AppAction } from "./reducer";
import type { AppState } from "../types";

/** Two separate contexts, so `dispatch` consumers don't re-render on every keystroke. */
export const StateContext = createContext<AppState | null>(null);
export const DispatchContext = createContext<Dispatch<AppAction> | null>(null);
