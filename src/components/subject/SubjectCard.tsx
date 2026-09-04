import { useRef } from "react";
import { Card } from "../ui/Card";
import { CardHead } from "../ui/CardHead";
import { CardHint } from "../ui/CardHint";
import { CardTitle } from "../ui/CardTitle";
import { Button } from "../ui/Button";
import { Pill } from "../ui/Pill";
import { TextArea } from "../ui/TextArea";
import { useT } from "../../locale/useT";
import { useAppDispatch, useAppState } from "../../state/hooks";

export function SubjectCard() {
  const { subject } = useAppState();
  const dispatch = useAppDispatch();
  const field = useRef<HTMLTextAreaElement>(null);
  const t = useT();

  const clear = (): void => {
    dispatch({ type: "subject", value: "" });
    field.current?.focus();
  };

  return (
    <Card labelledBy="title-subject">
      <CardHead
        actions={
          <Button variant="quiet" onClick={clear}>
            {t.subject.clear}
          </Button>
        }
      >
        <CardTitle id="title-subject">
          {t.subject.title} <Pill tone="soft">{t.subject.optional}</Pill>
        </CardTitle>
        <CardHint>{t.subject.hint}</CardHint>
      </CardHead>
      <TextArea
        id="subject"
        rows={3}
        modifier="subject"
        textareaRef={field}
        value={subject}
        onChange={(value) => dispatch({ type: "subject", value })}
        placeholder={t.subject.placeholder}
      />
    </Card>
  );
}
