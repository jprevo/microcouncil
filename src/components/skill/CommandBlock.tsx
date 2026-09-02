import { useCopyAction } from "../ui/useCopyAction";
import { Emoji } from "../ui/Emoji";

export function CommandBlock({ command }: { readonly command: string }) {
  const { copied, copy } = useCopyAction(
    command,
    "Commande copiée dans le presse-papiers",
  );

  return (
    <div className="command">
      <code className="command__text">{command}</code>
      <button
        className="command__copy"
        type="button"
        aria-label={copied ? "Commande copiée" : "Copier la commande"}
        onClick={copy}
      >
        <Emoji glyph={copied ? "✅" : "📋"} />
      </button>
    </div>
  );
}
