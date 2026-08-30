import { Tile } from '../tiles/Tile';
import { TileDescription } from '../tiles/TileDescription';
import { TileJob } from '../tiles/TileJob';
import { TileName } from '../tiles/TileName';
import { TraitList } from '../tiles/TraitList';
import { fillUsernameToken } from '../../lib/text';
import { useAppDispatch, useAppState } from '../../state/hooks';
import { useIsMemberSelected } from '../../state/selectors';
import type { Member } from '../../types';

/** Fiche d'un compagnon : bouton bascule (sélection multiple). */
export function MemberTile({ member }: { readonly member: Member }) {
  const selected = useIsMemberSelected(member.name);
  const { username } = useAppState();
  const dispatch = useAppDispatch();

  const description = fillUsernameToken(member.description, username);

  return (
    <Tile
      icon={member.icon}
      hint={description}
      selected={selected}
      onClick={() => dispatch({ type: 'toggleMember', name: member.name })}
    >
      <TileName>{member.name}</TileName>
      <TileJob>{member.job}</TileJob>
      {selected ? <TileDescription>{description}</TileDescription> : null}
      <TraitList traits={member.traits} />
    </Tile>
  );
}

