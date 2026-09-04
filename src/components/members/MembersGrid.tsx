import { MemberTile } from "./MemberTile";
import { EmptyMessage } from "../ui/EmptyMessage";
import { Grid } from "../ui/Grid";
import { targetKey } from "../../lib/library";
import { useT } from "../../locale/useT";
import type { CatalogMember } from "../../types";

interface MembersGridProps {
  readonly members: readonly CatalogMember[];
  readonly onEdit: (member: CatalogMember) => void;
}

export function MembersGrid({ members, onEdit }: MembersGridProps) {
  const t = useT();

  if (members.length === 0) {
    return <EmptyMessage>{t.members.empty}</EmptyMessage>;
  }

  return (
    <Grid variant="members">
      {members.map((member) => (
        <MemberTile
          key={targetKey(member.target)}
          member={member}
          onEdit={onEdit}
        />
      ))}
    </Grid>
  );
}
