import { useCallback, useState } from 'react';
import type { CatalogMember } from '../../types';

interface MemberEditorHandle {
  readonly open: boolean;
  /** La fiche éditée, ou null lorsqu'il s'agit d'une création. */
  readonly member: CatalogMember | null;
  readonly create: () => void;
  readonly edit: (member: CatalogMember) => void;
  readonly close: () => void;
}

/** Ouverture et fermeture de la boîte d'édition d'un membre. */
export function useMemberEditor(): MemberEditorHandle {
  const [open, setOpen] = useState(false);
  const [member, setMember] = useState<CatalogMember | null>(null);

  const create = useCallback((): void => {
    setMember(null);
    setOpen(true);
  }, []);

  const edit = useCallback((target: CatalogMember): void => {
    setMember(target);
    setOpen(true);
  }, []);

  const close = useCallback((): void => setOpen(false), []);

  return { open, member, create, edit, close };
}
