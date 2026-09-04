import { useMemo } from "react";
import { buildPrompt } from "../prompt";
import { useAppState } from "./hooks";
import { useSelectedEnvironment, useSelectedMembers } from "./selectors";
import { useLocale } from "../locale/useLocale";

/** The final prompt, recomputed whenever the state changes. */
export function usePrompt(): string {
  const { username, customInstructions, subject } = useAppState();
  const members = useSelectedMembers();
  const environment = useSelectedEnvironment();
  const { bundle } = useLocale();

  return useMemo(
    () =>
      buildPrompt(
        { username, members, environment, customInstructions, subject },
        bundle.promptTemplate,
        {
          usernameFallback: bundle.meta.usernameFallback,
          noMembers: bundle.ui.prompt.noMembers,
          noEnvironment: bundle.ui.prompt.noEnvironment,
          personalityLabel: bundle.ui.prompt.personalityLabel,
        },
      ),
    [username, members, environment, customInstructions, subject, bundle],
  );
}
