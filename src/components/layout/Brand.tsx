import { useT } from "../../locale/useT";

export function Brand() {
  const t = useT();
  return <h1 className="brand">{t.brand}</h1>;
}
