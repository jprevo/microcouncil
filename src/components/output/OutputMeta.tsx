import { CardHint } from "../ui/CardHint";
import { formatNumber } from "../../lib/text";
import { format } from "../../locale/i18n";
import { useLocale } from "../../locale/useLocale";
import { useT } from "../../locale/useT";
import { estimateTokens } from "../../prompt";

export function OutputMeta({ prompt }: { readonly prompt: string }) {
  const { bundle } = useLocale();
  const t = useT();

  return (
    <CardHint>
      {format(t.output.meta, {
        chars: formatNumber(prompt.length, bundle.meta.numberLocale),
        tokens: formatNumber(
          estimateTokens(prompt, bundle.meta.charsPerToken),
          bundle.meta.numberLocale,
        ),
      })}
    </CardHint>
  );
}
