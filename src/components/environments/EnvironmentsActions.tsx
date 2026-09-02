import { Button } from "../ui/Button";
import { useAppDispatch } from "../../state/hooks";

export function EnvironmentsActions() {
  const dispatch = useAppDispatch();

  return (
    <Button
      variant="quiet"
      onClick={() => dispatch({ type: "environment", title: null })}
    >
      Effacer
    </Button>
  );
}
