import { useCopyAction } from "../ui/useCopyAction";
import type { CopyControl } from "../ui/useCopyAction";
import { useT } from "../../locale/useT";

export function useCopyPrompt(prompt: string): CopyControl {
  const t = useT();
  return useCopyAction(prompt, t.output.copiedToast);
}
