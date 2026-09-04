import type { Ref } from "react";
import { Tile } from "../tiles/Tile";
import { TileDescription } from "../tiles/TileDescription";
import { OriginBadge } from "../tiles/OriginBadge";
import { TileEditButton } from "../tiles/TileEditButton";
import { TileJob } from "../tiles/TileJob";
import { TileName } from "../tiles/TileName";
import { TileSlot } from "../tiles/TileSlot";
import { TraitList } from "../tiles/TraitList";
import { fillUsernameToken } from "../../lib/text";
import { format } from "../../locale/i18n";
import { useLocale } from "../../locale/useLocale";
import { useT } from "../../locale/useT";
import { useAppDispatch, useAppState } from "../../state/hooks";
import { useIsMemberSelected } from "../../state/selectors";
import type { CatalogMember } from "../../types";

interface MemberTileProps {
  readonly member: CatalogMember;
  readonly tabIndex: number;
  readonly buttonRef: Ref<HTMLButtonElement>;
  readonly onFocus: () => void;
  readonly onEdit: (member: CatalogMember) => void;
}

/** A companion's tile: a toggle button (multiple selection) and an edit pencil. */
export function MemberTile({
  member,
  tabIndex,
  buttonRef,
  onFocus,
  onEdit,
}: MemberTileProps) {
  const selected = useIsMemberSelected(member.name);
  const { username } = useAppState();
  const dispatch = useAppDispatch();
  const { bundle } = useLocale();
  const t = useT();

  const description = fillUsernameToken(
    member.description,
    username,
    bundle.meta.usernameFallback,
  );

  return (
    <TileSlot
      action={
        <TileEditButton
          label={format(t.members.edit, { name: member.name })}
          tabIndex={tabIndex}
          onFocus={onFocus}
          onClick={() => onEdit(member)}
        />
      }
    >
      <Tile
        icon={member.icon}
        hint={description}
        selected={selected}
        tabIndex={tabIndex}
        buttonRef={buttonRef}
        onFocus={onFocus}
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
