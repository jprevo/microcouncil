import { useState } from 'react';
import { Stepper } from '../ui/Stepper';
import { MEMBERS } from '../../data';
import { useAppDispatch, useAppState } from '../../state/hooks';

/**
 * Le brouillon n'existe que pendant la saisie clavier : hors de là, le champ affiche
 * directement la valeur bornée par le reducer, sans rendu de rattrapage.
 */
export function RandomCountStepper() {
  const { randomCount } = useAppState();
  const dispatch = useAppDispatch();
  const [draft, setDraft] = useState<string | null>(null);

  const commit = (): void => {
    if (draft === null) return;
    const parsed = Number.parseInt(draft, 10);
    dispatch({ type: 'randomCount', value: Number.isNaN(parsed) ? randomCount : parsed });
    setDraft(null);
  };

  return (
    <Stepper
      label="Nombre de membres à tirer au sort"
      inputLabel="Nombre de membres"
      value={draft ?? String(randomCount)}
      max={MEMBERS.length}
      onDraft={setDraft}
      onCommit={commit}
      onNudge={(delta) => dispatch({ type: 'nudgeCount', delta })}
    />
  );
}
