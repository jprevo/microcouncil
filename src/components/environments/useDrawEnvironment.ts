import { ENVIRONMENTS } from '../../data';
import { pickOne } from '../../random';
import { useAppDispatch, useAppState } from '../../state/hooks';
import { useToast } from '../../toast/useToast';

/** Tire un environnement au sort, en évitant celui déjà sélectionné. */
export function useDrawEnvironment(): () => void {
  const { selectedEnvironment } = useAppState();
  const dispatch = useAppDispatch();
  const toast = useToast();

  return () => {
    const others = ENVIRONMENTS.filter((environment) => environment.title !== selectedEnvironment);
    const drawn = pickOne(others.length > 0 ? others : ENVIRONMENTS);
    if (drawn === undefined) return;
    dispatch({ type: 'environment', title: drawn.title });
    toast(`${drawn.icon} ${drawn.title}`);
  };
}
