import { Button } from "../ui/Button";
import { useT } from "../../locale/useT";
import { useAppDispatch } from "../../state/hooks";

export function EnvironmentsActions() {
  const dispatch = useAppDispatch();
  const t = useT();

  return (
    <Button
      variant="quiet"
      onClick={() => dispatch({ type: "environment", title: null })}
    >
      {t.environments.clear}
    </Button>
  );
}
