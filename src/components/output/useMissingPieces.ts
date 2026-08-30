import { useAppState } from '../../state/hooks';
import { useSelectedEnvironment, useSelectedMembers } from '../../state/selectors';

/** Ce qu'il manque pour un prompt complet, dans l'ordre de lecture du formulaire. */
export function useMissingPieces(): readonly string[] {
  const { username } = useAppState();
  const members = useSelectedMembers();
  const environment = useSelectedEnvironment();

  const missing: string[] = [];
  if (members.length === 0) missing.push('au moins un membre');
  if (environment === null) missing.push('un environnement');
  if (username.trim() === '') missing.push('votre nom');
  return missing;
}
