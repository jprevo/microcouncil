import { useEffect } from "react";
import { useAppDispatch, useAppState } from "./hooks";
import type { Theme } from "../types";

interface ThemeControl {
  readonly theme: Theme;
  readonly toggle: () => void;
}

/** Mirrors the theme onto `<html data-theme>`, where the CSS picks it up. */
export function useTheme(): ThemeControl {
  const { theme } = useAppState();
  const dispatch = useAppDispatch();

  useEffect(() => {
    document.documentElement.dataset["theme"] = theme;
  }, [theme]);

  return { theme, toggle: () => dispatch({ type: "toggleTheme" }) };
}
