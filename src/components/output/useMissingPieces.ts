import { useT } from "../../locale/useT";
import { useSelectedDynamic, useSelectedMembers } from "../../state/selectors";

/** What is still missing for a complete prompt, in the order the form reads. */
export function useMissingPieces(): readonly string[] {
  const members = useSelectedMembers();
  const dynamic = useSelectedDynamic();
  const t = useT();

  const missing: string[] = [];
  if (members.length === 0) missing.push(t.output.missingMembers);
  if (dynamic === null) missing.push(t.output.missingDynamic);
  return missing;
}
