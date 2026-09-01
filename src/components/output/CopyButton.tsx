import { useCopyPrompt } from "./useCopyPrompt";
import { Button } from "../ui/Button";
import { Emoji } from "../ui/Emoji";

export function CopyButton({ prompt }: { readonly prompt: string }) {
  const { copied, copy } = useCopyPrompt(prompt);

  return (
    <Button
      variant="primary"
      onClick={copy}
      {...(copied ? { state: "is-done" } : {})}
    >
      <Emoji glyph="📋" />{" "}
      <span>{copied ? "Copié !" : "Copier le prompt"}</span>
    </Button>
  );
}
