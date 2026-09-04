import { useMissingPieces } from "./useMissingPieces";
import { Notice } from "../ui/Notice";
import { format } from "../../locale/i18n";
import { useT } from "../../locale/useT";

/**
 * What the prompt is still short of. Wrapped in a live region rather than simply
 * appearing: the notice shows up several screens away from the tile that was
 * just toggled, where nobody driving the page by keyboard or screen reader would
 * see it arrive.
 */
export function OutputWarning() {
  const missing = useMissingPieces();
  const t = useT();

  return (
    <div className="output__status" role="status">
      {missing.length === 0 ? null : (
        <Notice>
          {format(t.output.warningMissing, { items: missing.join(", ") })}
        </Notice>
      )}
    </div>
  );
}
