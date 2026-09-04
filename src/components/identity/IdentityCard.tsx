import { Card } from "../ui/Card";
import { CardHead } from "../ui/CardHead";
import { CardTitle } from "../ui/CardTitle";
import { Pill } from "../ui/Pill";
import { TextField } from "../ui/TextField";
import { useAppDispatch, useAppState } from "../../state/hooks";
import { useT } from "../../locale/useT";

export function IdentityCard() {
  const { username } = useAppState();
  const dispatch = useAppDispatch();
  const t = useT();

  return (
    <Card labelledBy="title-identity">
      <CardHead
        title={
          <CardTitle id="title-identity">
            {t.identity.title} <Pill tone="soft">{t.identity.optional}</Pill>
          </CardTitle>
        }
      />
      <TextField
        id="username"
        value={username}
        onChange={(value) => dispatch({ type: "username", value })}
        autoComplete="given-name"
        ariaLabel={t.identity.label}
        placeholder={t.identity.placeholder}
      />
    </Card>
  );
}
