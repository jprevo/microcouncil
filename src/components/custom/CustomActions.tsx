import { Button } from "../ui/Button";
import { useLocale } from "../../locale/useLocale";
import { useT } from "../../locale/useT";
import { useAppDispatch } from "../../state/hooks";

export function CustomActions() {
  const dispatch = useAppDispatch();
  const { bundle } = useLocale();
  const t = useT();

  return (
    <>
      <Button
        variant="ghost"
        onClick={() =>
          dispatch({ type: "custom", value: bundle.customExample })
        }
      >
        {t.custom.example}
      </Button>
      <Button
        variant="quiet"
        onClick={() => dispatch({ type: "custom", value: "" })}
      >
        {t.custom.clear}
      </Button>
    </>
  );
}
