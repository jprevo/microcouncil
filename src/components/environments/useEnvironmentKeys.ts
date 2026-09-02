import type { KeyboardEvent } from "react";
import { useAppDispatch, useAppState } from "../../state/hooks";
import type { Environment } from "../../types";

const STEPS: Readonly<Record<string, number>> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

/** Navigation aux flèches dans le groupe radio des environnements. */
export function useEnvironmentKeys(
  environments: readonly Environment[],
  focus: (title: string) => void,
) {
  const { selectedEnvironment } = useAppState();
  const dispatch = useAppDispatch();

  return (event: KeyboardEvent<HTMLDivElement>): void => {
    const step = STEPS[event.key];
    if (step === undefined) return;

    const titles = environments.map((environment) => environment.title);
    const current =
      selectedEnvironment === null ? -1 : titles.indexOf(selectedEnvironment);
    const next = titles[(current + step + titles.length) % titles.length];
    if (next === undefined) return;

    event.preventDefault();
    dispatch({ type: "environment", title: next });
    focus(next);
  };
}
