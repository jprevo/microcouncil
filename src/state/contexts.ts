import { createContext } from "react";
import type { Dispatch } from "react";
import type { AppAction } from "./reducer";
import type { AppState } from "../types";

/** Deux contextes séparés : les consommateurs de `dispatch` ne re-rendent pas à chaque frappe. */
export const StateContext = createContext<AppState | null>(null);
export const DispatchContext = createContext<Dispatch<AppAction> | null>(null);
