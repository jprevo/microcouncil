import type { KeyboardEvent } from 'react';
import { ENVIRONMENTS } from '../../data';
import { useAppDispatch, useAppState } from '../../state/hooks';

const STEPS: Readonly<Record<string, number>> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

/** Navigation aux flèches dans le groupe radio des environnements. */
export function useEnvironmentKeys(focus: (title: string) => void) {
  const { selectedEnvironment } = useAppState();
  const dispatch = useAppDispatch();

  return (event: KeyboardEvent<HTMLDivElement>): void => {
    const step = STEPS[event.key];
    if (step === undefined) return;

    const titles = ENVIRONMENTS.map((environment) => environment.title);
    const current = selectedEnvironment === null ? -1 : titles.indexOf(selectedEnvironment);
    const next = titles[(current + step + titles.length) % titles.length];
    if (next === undefined) return;

    event.preventDefault();
    dispatch({ type: 'environment', title: next });
    focus(next);
  };
}
