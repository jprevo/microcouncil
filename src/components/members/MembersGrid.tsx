import { MemberTile } from './MemberTile';
import { EmptyMessage } from '../ui/EmptyMessage';
import { Grid } from '../ui/Grid';
import type { Member } from '../../types';

export function MembersGrid({ members }: { readonly members: readonly Member[] }) {
  if (members.length === 0) {
    return <EmptyMessage>Aucun membre ne correspond à ce filtre.</EmptyMessage>;
  }

  return (
    <Grid variant="members">
      {members.map((member) => (
        <MemberTile key={member.name} member={member} />
      ))}
    </Grid>
  );
}
