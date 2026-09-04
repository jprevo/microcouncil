import { useMissingPieces } from "./useMissingPieces";
import { Notice } from "../ui/Notice";
import { format } from "../../locale/i18n";
import { useT } from "../../locale/useT";

export function OutputWarning() {
  const missing = useMissingPieces();
  const t = useT();
  if (missing.length === 0) return null;
  return (
    <Notice>
      {format(t.output.warningMissing, { items: missing.join(", ") })}
    </Notice>
  );
}
