import { useMemo, useState } from 'react';
import { MembersActions } from './MembersActions';
import { MembersCount } from './MembersCount';
import { MembersFilter } from './MembersFilter';
import { MembersGrid } from './MembersGrid';
import { Card } from '../ui/Card';
import { CardHead } from '../ui/CardHead';
import { CardHint } from '../ui/CardHint';
import { CardTitle } from '../ui/CardTitle';
import { MEMBERS } from '../../data';
import { filterMembers } from '../../lib/search';

export function MembersCard() {
  const [query, setQuery] = useState('');
  const visible = useMemo(() => filterMembers(MEMBERS, query), [query]);

  return (
    <Card labelledBy="title-members">
      <CardHead actions={<MembersActions />}>
        <CardTitle id="title-members">
          Les membres du conseil <MembersCount />
        </CardTitle>
        <CardHint>Idéalement entre 3 et 7 membres.</CardHint>
      </CardHead>
      <MembersFilter query={query} onChange={setQuery} />
      <MembersGrid members={visible} />
    </Card>
  );
}
