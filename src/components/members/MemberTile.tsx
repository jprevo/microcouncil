import { Tile } from "../tiles/Tile";
import { TileDescription } from "../tiles/TileDescription";
import { OriginBadge } from "../tiles/OriginBadge";
import { TileEditButton } from "../tiles/TileEditButton";
import { TileJob } from "../tiles/TileJob";
import { TileName } from "../tiles/TileName";
import { TileSlot } from "../tiles/TileSlot";
import { TraitList } from "../tiles/TraitList";
import { fillUsernameToken } from "../../lib/text";
import { useAppDispatch, useAppState } from "../../state/hooks";
import { useIsMemberSelected } from "../../state/selectors";
import type { CatalogMember } from "../../types";

interface MemberTileProps {
  readonly member: CatalogMember;
  readonly onEdit: (member: CatalogMember) => void;
}

/** A companion's tile: a toggle button (multiple selection) and an edit pencil. */
export function MemberTile({ member, onEdit }: MemberTileProps) {
  const selected = useIsMemberSelected(member.name);
  const { username } = useAppState();
  const dispatch = useAppDispatch();

  const description = fillUsernameToken(member.description, username);

  return (
    <TileSlot
      action={
        <TileEditButton
          label={`Modifier ${member.name}`}
          onClick={() => onEdit(member)}
        />
      }
    >
      <Tile
        icon={member.icon}
        hint={description}
        selected={selected}
        onClick={() => dispatch({ type: "toggleMember", name: member.name })}
      >
        <TileName>{member.name}</TileName>
        <TileJob>{member.job}</TileJob>
        <OriginBadge origin={member} />
        {selected ? <TileDescription>{description}</TileDescription> : null}
        <TraitList traits={member.traits} />
      </Tile>
    </TileSlot>
  );
}
