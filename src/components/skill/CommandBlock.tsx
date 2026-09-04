import { useCopyAction } from "../ui/useCopyAction";
import { Emoji } from "../ui/Emoji";
import { useT } from "../../locale/useT";

export function CommandBlock({ command }: { readonly command: string }) {
  const t = useT();
  const { copied, copy } = useCopyAction(command, t.misc.commandCopiedToast);

  return (
    <div className="command">
      <code className="command__text">{command}</code>
      <button
        className="command__copy"
        type="button"
        aria-label={copied ? t.misc.commandCopiedAria : t.misc.commandCopyAria}
        onClick={copy}
      >
        <Emoji glyph={copied ? "✅" : "📋"} />
      </button>
    </div>
  );
}
