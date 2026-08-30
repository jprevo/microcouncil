import { CustomActions } from './CustomActions';
import { Card } from '../ui/Card';
import { CardHead } from '../ui/CardHead';
import { CardHint } from '../ui/CardHint';
import { CardTitle } from '../ui/CardTitle';
import { TextArea } from '../ui/TextArea';
import { useAppDispatch, useAppState } from '../../state/hooks';

export function CustomCard() {
  const { customInstructions } = useAppState();
  const dispatch = useAppDispatch();

  return (
    <Card labelledBy="title-custom">
      <CardHead actions={<CustomActions />}>
        <CardTitle id="title-custom">Instructions additionnelles</CardTitle>
        <CardHint>Optionnel — sauvegardé automatiquement dans votre navigateur.</CardHint>
      </CardHead>
      <TextArea
        id="custom"
        rows={4}
        value={customInstructions}
        onChange={(value) => dispatch({ type: 'custom', value })}
        placeholder="Par exemple : contraintes de format, mémoire à utiliser, sujets à éviter…"
      />
    </Card>
  );
}
