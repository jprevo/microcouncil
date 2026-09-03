import { useAppState } from "../../state/hooks";
import {
  useSelectedEnvironment,
  useSelectedMembers,
} from "../../state/selectors";

/** What is still missing for a complete prompt, in the order the form reads. */
export function useMissingPieces(): readonly string[] {
  const { username } = useAppState();
  const members = useSelectedMembers();
  const environment = useSelectedEnvironment();

  const missing: string[] = [];
  if (members.length === 0) missing.push("au moins un membre");
  if (environment === null) missing.push("un environnement");
  if (username.trim() === "") missing.push("votre nom");
  return missing;
}
