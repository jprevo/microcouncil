import { CardHint } from "../ui/CardHint";
import { formatNumber } from "../../lib/text";
import { estimateTokens } from "../../prompt";

export function OutputMeta({ prompt }: { readonly prompt: string }) {
  return (
    <CardHint>
      {formatNumber(prompt.length)} caractères · ~
      {formatNumber(estimateTokens(prompt))} tokens
    </CardHint>
  );
}
