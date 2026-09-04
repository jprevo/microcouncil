import { Card } from "../ui/Card";
import { CardHead } from "../ui/CardHead";
import { CardTitle } from "../ui/CardTitle";
import { TextField } from "../ui/TextField";
import { useAppDispatch, useAppState } from "../../state/hooks";
import { useT } from "../../locale/useT";

export function IdentityCard() {
  const { username } = useAppState();
  const dispatch = useAppDispatch();
  const t = useT();

  return (
    <Card labelledBy="title-identity">
      <CardHead>
        <CardTitle id="title-identity">{t.identity.title}</CardTitle>
      </CardHead>
      <TextField
        id="username"
        value={username}
        onChange={(value) => dispatch({ type: "username", value })}
        autoComplete="given-name"
        placeholder={t.identity.placeholder}
      />
    </Card>
  );
}
