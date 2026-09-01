import { EnvironmentsActions } from "./EnvironmentsActions";
import { EnvironmentsGrid } from "./EnvironmentsGrid";
import { Card } from "../ui/Card";
import { CardHead } from "../ui/CardHead";
import { CardHint } from "../ui/CardHint";
import { CardTitle } from "../ui/CardTitle";

const TITLE_ID = "title-environment";

export function EnvironmentsCard() {
  return (
    <Card labelledBy={TITLE_ID}>
      <CardHead actions={<EnvironmentsActions />}>
        <CardTitle id={TITLE_ID}>L'environnement</CardTitle>
        <CardHint>Le décor dans lequel se tient la discussion.</CardHint>
      </CardHead>
      <EnvironmentsGrid labelledBy={TITLE_ID} />
    </Card>
  );
}
