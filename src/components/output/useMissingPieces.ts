import { useT } from "../../locale/useT";
import {
  useSelectedEnvironment,
  useSelectedMembers,
} from "../../state/selectors";

/** What is still missing for a complete prompt, in the order the form reads. */
export function useMissingPieces(): readonly string[] {
  const members = useSelectedMembers();
  const environment = useSelectedEnvironment();
  const t = useT();

  const missing: string[] = [];
  if (members.length === 0) missing.push(t.output.missingMembers);
  if (environment === null) missing.push(t.output.missingEnvironment);
  return missing;
}
