import { Tile } from '../tiles/Tile';
import { TileBadge } from '../tiles/TileBadge';
import { TileDescription } from '../tiles/TileDescription';
import { TileEditButton } from '../tiles/TileEditButton';
import { TileJob } from '../tiles/TileJob';
import { TileName } from '../tiles/TileName';
import { TileSlot } from '../tiles/TileSlot';
import { TraitList } from '../tiles/TraitList';
import { fillUsernameToken } from '../../lib/text';
import { useAppDispatch, useAppState } from '../../state/hooks';
import { useIsMemberSelected } from '../../state/selectors';
import type { CatalogMember } from '../../types';

interface MemberTileProps {
  readonly member: CatalogMember;
  readonly onEdit: (member: CatalogMember) => void;
}

/** Ce qui distingue la fiche du catalogue livré, s'il y a lieu. */
function originLabel(member: CatalogMember): string | null {
  if (member.target.kind === 'custom') return 'ajouté';
  return member.edited ? 'modifié' : null;
}

/** Fiche d'un compagnon : bouton bascule (sélection multiple) et crayon d'édition. */
export function MemberTile({ member, onEdit }: MemberTileProps) {
  const selected = useIsMemberSelected(member.name);
  const { username } = useAppState();
  const dispatch = useAppDispatch();

  const description = fillUsernameToken(member.description, username);
  const origin = originLabel(member);

  return (
    <TileSlot
      action={<TileEditButton label={`Modifier ${member.name}`} onClick={() => onEdit(member)} />}
    >
      <Tile
        icon={member.icon}
        hint={description}
        selected={selected}
        onClick={() => dispatch({ type: 'toggleMember', name: member.name })}
      >
        <TileName>{member.name}</TileName>
        <TileJob>{member.job}</TileJob>
        {origin === null ? null : <TileBadge>{origin}</TileBadge>}
        {selected ? <TileDescription>{description}</TileDescription> : null}
        <TraitList traits={member.traits} />
      </Tile>
    </TileSlot>
  );
}
