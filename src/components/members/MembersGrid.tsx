import { MemberTile } from "./MemberTile";
import { EmptyMessage } from "../ui/EmptyMessage";
import { Grid } from "../ui/Grid";
import { targetKey } from "../../lib/catalog";
import type { CatalogMember } from "../../types";

interface MembersGridProps {
  readonly members: readonly CatalogMember[];
  readonly onEdit: (member: CatalogMember) => void;
}

export function MembersGrid({ members, onEdit }: MembersGridProps) {
  if (members.length === 0) {
    return <EmptyMessage>Aucun membre ne correspond à ce filtre.</EmptyMessage>;
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
