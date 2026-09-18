import { Button } from "../ui/Button";
import { useT } from "../../locale/useT";
import { useAppDispatch } from "../../state/hooks";

export function DynamicsActions() {
  const dispatch = useAppDispatch();
  const t = useT();

  return (
    <Button
      variant="quiet"
      onClick={() => dispatch({ type: "dynamic", title: null })}
    >
      {t.dynamics.clear}
    </Button>
  );
}
