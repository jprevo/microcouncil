import { MemberTile } from "./MemberTile";
import { EmptyMessage } from "../ui/EmptyMessage";
import { Grid } from "../ui/Grid";
import { useRovingGrid } from "../tiles/useRovingGrid";
import { targetKey } from "../../lib/library";
import { useT } from "../../locale/useT";
import { useAppState } from "../../state/hooks";
import type { CatalogMember } from "../../types";

interface MembersGridProps {
  readonly members: readonly CatalogMember[];
  readonly onEdit: (member: CatalogMember) => void;
}

/**
 * Where the group is entered from the keyboard: the first member of the council
 * that is still on screen, so tabbing in lands on the selection rather than at
 * the top of a list forty tiles long.
 */
function entryName(
  members: readonly CatalogMember[],
  selected: readonly string[],
): string | undefined {
  return members.find((member) => selected.includes(member.name))?.name;
}

/**
 * A toolbar rather than a plain grid: one tab stop for the whole catalogue, and
 * the arrows walk it. The role is what tells a screen reader that they do.
 */
export function MembersGrid({ members, onEdit }: MembersGridProps) {
  const { selectedMembers } = useAppState();
  const names = members.map((member) => member.name);
  const roving = useRovingGrid(names, entryName(members, selectedMembers));
  const t = useT();

  if (members.length === 0) {
    return <EmptyMessage>{t.members.empty}</EmptyMessage>;
  }

  return (
    <Grid
      variant="members"
      role="toolbar"
      labelledBy="title-members"
      onKeyDown={roving.onKeyDown}
    >
      {members.map((member) => (
        <MemberTile
          key={targetKey(member.target)}
          member={member}
          tabIndex={roving.tabIndexFor(member.name)}
          buttonRef={roving.register(member.name)}
          onFocus={() => roving.hold(member.name)}
          onEdit={onEdit}
        />
      ))}
    </Grid>
  );
}
