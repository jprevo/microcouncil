import { Card } from '../ui/Card';
import { CardHead } from '../ui/CardHead';
import { CardTitle } from '../ui/CardTitle';
import { TextField } from '../ui/TextField';
import { useAppDispatch, useAppState } from '../../state/hooks';

export function IdentityCard() {
  const { username } = useAppState();
  const dispatch = useAppDispatch();

  return (
    <Card labelledBy="title-identity">
      <CardHead>
        <CardTitle id="title-identity">Votre nom</CardTitle>
      </CardHead>
      <TextField
        id="username"
        value={username}
        onChange={(value) => dispatch({ type: 'username', value })}
        autoComplete="given-name"
        placeholder="Votre nom"
      />
    </Card>
  );
}
