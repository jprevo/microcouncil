import { RandomCountStepper } from './RandomCountStepper';
import { useDrawMembers } from './useDrawMembers';
import { Button } from '../ui/Button';
import { Emoji } from '../ui/Emoji';
import { useAppDispatch } from '../../state/hooks';

export function MembersActions() {
  const dispatch = useAppDispatch();
  const draw = useDrawMembers();

  return (
    <>
      <RandomCountStepper />
      <Button variant="ghost" onClick={draw}>
        <Emoji glyph="🎲" /> Tirer au sort
      </Button>
      <Button variant="quiet" onClick={() => dispatch({ type: 'members', names: [] })}>
        Tout effacer
      </Button>
    </>
  );
}
