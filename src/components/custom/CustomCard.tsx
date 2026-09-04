import { CustomActions } from "./CustomActions";
import { Card } from "../ui/Card";
import { CardHead } from "../ui/CardHead";
import { CardTitle } from "../ui/CardTitle";
import { Pill } from "../ui/Pill";
import { TextArea } from "../ui/TextArea";
import { useT } from "../../locale/useT";
import { useAppDispatch, useAppState } from "../../state/hooks";

export function CustomCard() {
  const { customInstructions } = useAppState();
  const dispatch = useAppDispatch();
  const t = useT();

  return (
    <Card labelledBy="title-custom">
      <CardHead
        title={
          <CardTitle id="title-custom">
            {t.custom.title} <Pill tone="soft">{t.custom.optional}</Pill>
          </CardTitle>
        }
        actions={<CustomActions />}
      />
      <TextArea
        id="custom"
        rows={4}
        value={customInstructions}
        onChange={(value) => dispatch({ type: "custom", value })}
        placeholder={t.custom.placeholder}
      />
    </Card>
  );
}
