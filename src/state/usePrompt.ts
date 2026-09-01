import { useMemo } from "react";
import { buildPrompt } from "../prompt";
import { useAppState } from "./hooks";
import { useSelectedEnvironment, useSelectedMembers } from "./selectors";

/** Le prompt final, recalculé à chaque changement de l'état. */
export function usePrompt(): string {
  const { username, customInstructions, subject } = useAppState();
  const members = useSelectedMembers();
  const environment = useSelectedEnvironment();

  return useMemo(
    () =>
      buildPrompt({
        username,
        members,
        environment,
        customInstructions,
        subject,
      }),
    [username, members, environment, customInstructions, subject],
  );
}
