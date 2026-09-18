import { useMemo } from "react";
import { buildPrompt } from "../prompt";
import { useAppState } from "./hooks";
import { useSelectedDynamic, useSelectedMembers } from "./selectors";
import { useLocale } from "../locale/useLocale";

/** The final prompt, recomputed whenever the state changes. */
export function usePrompt(): string {
  const { username, customInstructions, subject } = useAppState();
  const members = useSelectedMembers();
  const dynamic = useSelectedDynamic();
  const { bundle } = useLocale();

  return useMemo(
    () =>
      buildPrompt(
        { username, members, dynamic, customInstructions, subject },
        bundle.promptTemplate,
        {
          usernameFallback: bundle.meta.usernameFallback,
          noMembers: bundle.ui.prompt.noMembers,
          noDynamic: bundle.ui.prompt.noDynamic,
          personalityLabel: bundle.ui.prompt.personalityLabel,
        },
      ),
    [username, members, dynamic, customInstructions, subject, bundle],
  );
}
