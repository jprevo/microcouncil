import { MemberEditorActions } from './MemberEditorActions';
import { MemberFields } from './MemberFields';
import { useMemberDraft } from './useMemberDraft';
import { Notice } from '../ui/Notice';
import type { CatalogMember } from '../../types';

interface MemberEditorProps {
  /** La fiche à modifier, ou null pour en créer une. */
  readonly member: CatalogMember | null;
  readonly titleId: string;
  readonly onClose: () => void;
}

export function MemberEditor({ member, titleId, onClose }: MemberEditorProps) {
  const form = useMemberDraft(member, onClose);

  return (
    <>
      <div className="modal__head">
        <h2 id={titleId}>{member === null ? '✨ Nouveau membre' : `✏️ ${member.name}`}</h2>
        <button className="modal__close" type="button" aria-label="Fermer" onClick={onClose}>
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      <div className="modal__body modal__body--form">
        <MemberFields draft={form.draft} onChange={form.update} />
      </div>

      {/* Hors du corps défilant : un message d'erreur doit rester sous les yeux. */}
      {form.error === null ? null : (
        <div className="modal__error" role="alert">
          <Notice>{form.error}</Notice>
        </div>
      )}

      <MemberEditorActions member={member} onSave={form.save} onClose={onClose} />
    </>
  );
}
