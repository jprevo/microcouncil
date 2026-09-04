import { TextField } from "../ui/TextField";
import { useT } from "../../locale/useT";

interface MembersFilterProps {
  readonly query: string;
  readonly onChange: (query: string) => void;
}

export function MembersFilter({ query, onChange }: MembersFilterProps) {
  const t = useT();
  return (
    <TextField
      id="members-filter"
      type="search"
      modifier="search"
      value={query}
      onChange={onChange}
      ariaLabel={t.members.filterAriaLabel}
      placeholder={t.members.filterPlaceholder}
    />
  );
}
