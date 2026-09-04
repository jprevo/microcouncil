import { Button } from "../ui/Button";
import { useT } from "../../locale/useT";
import { useAppDispatch } from "../../state/hooks";

export function MembersActions() {
  const dispatch = useAppDispatch();
  const t = useT();

  return (
    <Button
      variant="quiet"
      onClick={() => dispatch({ type: "members", names: [] })}
    >
      {t.members.clearAll}
    </Button>
  );
}
