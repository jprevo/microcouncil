import { MEMBERS } from '../../data';
import { plural } from '../../lib/text';
import { pickMany } from '../../random';
import { useAppDispatch, useAppState } from '../../state/hooks';
import { useToast } from '../../toast/useToast';

/** Tire `randomCount` compagnons au sort et remplace la sélection. */
export function useDrawMembers(): () => void {
  const { randomCount } = useAppState();
  const dispatch = useAppDispatch();
  const toast = useToast();

  return () => {
    const names = pickMany(MEMBERS, randomCount).map((member) => member.name);
    dispatch({ type: 'members', names });
    toast(`${names.length} ${plural(names.length, 'membre')} ${plural(names.length, 'tiré')} au sort`);
  };
}
