import { useT } from "../../locale/useT";

export function Lede() {
  const t = useT();
  return <p className="lede">{t.lede}</p>;
}
