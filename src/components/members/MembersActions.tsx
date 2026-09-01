import { Button } from "../ui/Button";
import { useAppDispatch } from "../../state/hooks";

export function MembersActions() {
  const dispatch = useAppDispatch();

  return (
    <Button
      variant="quiet"
      onClick={() => dispatch({ type: "members", names: [] })}
    >
      Tout effacer
    </Button>
  );
}
