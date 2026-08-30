import { Pill } from '../ui/Pill';
import { plural } from '../../lib/text';
import { useAppState } from '../../state/hooks';

export function MembersCount() {
  const count = useAppState().selectedMembers.length;
  return (
    <Pill>
      {count} {plural(count, 'sélectionné')}
    </Pill>
  );
}
