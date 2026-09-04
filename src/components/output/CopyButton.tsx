import { useCopyPrompt } from "./useCopyPrompt";
import { Button } from "../ui/Button";
import { Emoji } from "../ui/Emoji";
import { useT } from "../../locale/useT";

export function CopyButton({ prompt }: { readonly prompt: string }) {
  const { copied, copy } = useCopyPrompt(prompt);
  const t = useT();

  return (
    <Button
      variant="primary"
      onClick={copy}
      {...(copied ? { state: "is-done" } : {})}
    >
      <Emoji glyph="📋" />{" "}
      <span>{copied ? t.output.copied : t.output.copy}</span>
    </Button>
  );
}
