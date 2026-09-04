import { Pill } from "../ui/Pill";
import { pluralize } from "../../locale/i18n";
import { useLocale } from "../../locale/useLocale";
import { useT } from "../../locale/useT";
import { useAppState } from "../../state/hooks";

export function MembersCount() {
  const count = useAppState().selectedMembers.length;
  const t = useT();
  const { numberLocale } = useLocale().bundle.meta;
  return (
    <Pill>
      {count} {pluralize(count, t.members.selectedCount, numberLocale)}
    </Pill>
  );
}
