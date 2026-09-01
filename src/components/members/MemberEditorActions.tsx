import { Button } from "../ui/Button";
import { useAppDispatch } from "../../state/hooks";
import { useToast } from "../../toast/useToast";
import type { CatalogMember } from "../../types";

interface MemberEditorActionsProps {
  readonly member: CatalogMember | null;
  readonly onSave: () => void;
  readonly onClose: () => void;
}

/** Pied de la boîte d'édition : suppression, retour à l'original, annulation, sauvegarde. */
export function MemberEditorActions({
  member,
  onSave,
  onClose,
}: MemberEditorActionsProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const remove = (): void => {
    if (member === null) return;
    if (!globalThis.confirm(`Supprimer définitivement ${member.name} ?`))
      return;
    dispatch({ type: "deleteMember", target: member.target });
    toast(`${member.name} quitte le catalogue`);
    onClose();
  };

  const restore = (): void => {
    if (member === null) return;
    dispatch({ type: "restoreMember", target: member.target });
    toast("Version d’origine rétablie");
    onClose();
  };

  return (
    <div className="modal__foot">
      <div className="modal__foot-left">
        {member?.target.kind === "custom" ? (
          <Button variant="quiet" onClick={remove}>
            Supprimer
          </Button>
        ) : null}
        {member?.edited === true ? (
          <Button variant="quiet" onClick={restore}>
            Revenir à l'original
          </Button>
        ) : null}
      </div>
      <div className="modal__foot-right">
        <Button variant="quiet" onClick={onClose}>
          Annuler
        </Button>
        <Button variant="primary" onClick={onSave}>
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
