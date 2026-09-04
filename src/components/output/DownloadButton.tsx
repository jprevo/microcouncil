import { Button } from "../ui/Button";
import { Emoji } from "../ui/Emoji";
import { downloadMarkdown } from "../../lib/download";
import { slugify } from "../../lib/text";
import { useT } from "../../locale/useT";
import { useAppState } from "../../state/hooks";
import { useToast } from "../../toast/useToast";

export function DownloadButton({ prompt }: { readonly prompt: string }) {
  const { username } = useAppState();
  const toast = useToast();
  const t = useT();

  const download = (): void => {
    const slug = slugify(username);
    downloadMarkdown(
      prompt,
      slug === "" ? "microcouncil.md" : `microcouncil-${slug}.md`,
    );
    toast(t.output.downloadedToast);
  };

  return (
    <Button variant="quiet" onClick={download}>
      <Emoji glyph="⬇️" /> {t.output.download}
    </Button>
  );
}
