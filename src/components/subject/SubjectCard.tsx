import { useRef } from "react";
import { Card } from "../ui/Card";
import { CardHead } from "../ui/CardHead";
import { CardHint } from "../ui/CardHint";
import { CardTitle } from "../ui/CardTitle";
import { Button } from "../ui/Button";
import { Pill } from "../ui/Pill";
import { TextArea } from "../ui/TextArea";
import { useAppDispatch, useAppState } from "../../state/hooks";

export function SubjectCard() {
  const { subject } = useAppState();
  const dispatch = useAppDispatch();
  const field = useRef<HTMLTextAreaElement>(null);

  const clear = (): void => {
    dispatch({ type: "subject", value: "" });
    field.current?.focus();
  };

  return (
    <Card labelledBy="title-subject">
      <CardHead
        actions={
          <Button variant="quiet" onClick={clear}>
            Effacer
          </Button>
        }
      >
        <CardTitle id="title-subject">
          Le sujet de votre demande <Pill tone="soft">optionnel</Pill>
        </CardTitle>
        <CardHint>
          Si vous le laissez vide, un membre vous le demandera.
        </CardHint>
      </CardHead>
      <TextArea
        id="subject"
        rows={3}
        modifier="subject"
        textareaRef={field}
        value={subject}
        onChange={(value) => dispatch({ type: "subject", value })}
        placeholder="Par exemple : je dois choisir entre deux offres d'emploi et je n'arrive pas à trancher."
      />
    </Card>
  );
}
