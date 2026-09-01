import { useMissingPieces } from "./useMissingPieces";
import { Notice } from "../ui/Notice";

export function OutputWarning() {
  const missing = useMissingPieces();
  if (missing.length === 0) return null;
  return <Notice>Il manque {missing.join(", ")}.</Notice>;
}
