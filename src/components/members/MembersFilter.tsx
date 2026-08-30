import { TextField } from '../ui/TextField';

interface MembersFilterProps {
  readonly query: string;
  readonly onChange: (query: string) => void;
}

export function MembersFilter({ query, onChange }: MembersFilterProps) {
  return (
    <TextField
      id="members-filter"
      type="search"
      modifier="search"
      value={query}
      onChange={onChange}
      ariaLabel="Filtrer les membres"
      placeholder="Filtrer par nom, métier ou trait…"
    />
  );
}
