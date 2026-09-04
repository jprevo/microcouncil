import { useT } from "../../locale/useT";

/**
 * The preview is a scrolling box, so it is a tab stop: someone who cannot use a
 * mouse has to be able to reach its scrollbar. A tab stop needs a name — landing
 * on an unnamed one is landing on nothing — hence the region and its label.
 */
export function PromptBox({ prompt }: { readonly prompt: string }) {
  const t = useT();
  return (
    <pre
      className="prompt"
      role="region"
      aria-label={t.output.promptRegion}
      tabIndex={0}
    >
      {prompt}
    </pre>
  );
}
