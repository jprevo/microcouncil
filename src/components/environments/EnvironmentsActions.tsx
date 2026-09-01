import { useDrawEnvironment } from "./useDrawEnvironment";
import { Button } from "../ui/Button";
import { Emoji } from "../ui/Emoji";
import { useAppDispatch } from "../../state/hooks";

export function EnvironmentsActions() {
  const dispatch = useAppDispatch();
  const draw = useDrawEnvironment();

  return (
    <>
      <Button variant="ghost" onClick={draw}>
        <Emoji glyph="🎲" /> Aléatoire
      </Button>
      <Button
        variant="quiet"
        onClick={() => dispatch({ type: "environment", title: null })}
      >
        Effacer
      </Button>
    </>
  );
}
