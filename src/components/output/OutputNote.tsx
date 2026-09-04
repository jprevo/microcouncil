import { useT } from "../../locale/useT";

export function OutputNote() {
  const t = useT();
  return <p className="output__note">{t.output.note}</p>;
}
