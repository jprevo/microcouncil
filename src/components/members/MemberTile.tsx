import { Tile } from '../tiles/Tile';
import { TileJob } from '../tiles/TileJob';
import { TileName } from '../tiles/TileName';
import { TraitList } from '../tiles/TraitList';
import { useAppDispatch } from '../../state/hooks';
import { useIsMemberSelected } from '../../state/selectors';
import type { Member } from '../../types';

/** Fiche d'un compagnon : bouton bascule (sélection multiple). */
export function MemberTile({ member }: { readonly member: Member }) {
  const selected = useIsMemberSelected(member.name);
  const dispatch = useAppDispatch();

  return (
    <Tile
      icon={member.icon}
      hint={member.description}
      selected={selected}
      onClick={() => dispatch({ type: 'toggleMember', name: member.name })}
    >
      <TileName>{member.name}</TileName>
      <TileJob>{member.job}</TileJob>
      <TraitList traits={member.traits} />
    </Tile>
  );
}
