import { Button } from "../ui/Button";
import { CUSTOM_EXAMPLE } from "../../data";
import { useAppDispatch } from "../../state/hooks";

export function CustomActions() {
  const dispatch = useAppDispatch();

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => dispatch({ type: "custom", value: CUSTOM_EXAMPLE })}
      >
        Exemple
      </Button>
      <Button
        variant="quiet"
        onClick={() => dispatch({ type: "custom", value: "" })}
      >
        Effacer
      </Button>
    </>
  );
}
