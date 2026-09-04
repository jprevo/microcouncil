import { Pill } from "../ui/Pill";
import { pluralize } from "../../locale/i18n";
import { useT } from "../../locale/useT";
import { useAppState } from "../../state/hooks";

export function MembersCount() {
  const count = useAppState().selectedMembers.length;
  const t = useT();
  return (
    <Pill>
      {count} {pluralize(count, t.members.selectedCount)}
    </Pill>
  );
}
