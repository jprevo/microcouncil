import { Button } from "../ui/Button";
import { Emoji } from "../ui/Emoji";
import { downloadMarkdown } from "../../lib/download";
import { slugify } from "../../lib/text";
import { useAppState } from "../../state/hooks";
import { useToast } from "../../toast/useToast";

export function DownloadButton({ prompt }: { readonly prompt: string }) {
  const { username } = useAppState();
  const toast = useToast();

  const download = (): void => {
    const slug = slugify(username);
    downloadMarkdown(
      prompt,
      slug === "" ? "microcouncil.md" : `microcouncil-${slug}.md`,
    );
    toast("Prompt téléchargé");
  };

  return (
    <Button variant="quiet" onClick={download}>
      <Emoji glyph="⬇️" /> Télécharger
    </Button>
  );
}
