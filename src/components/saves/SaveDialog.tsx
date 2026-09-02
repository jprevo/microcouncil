import { useState } from "react";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Notice } from "../ui/Notice";
import { TextField } from "../ui/TextField";
import { stripOrigin } from "../../lib/library";
import { formatDate } from "../../lib/text";
import { MAX_SAVES } from "../../saves/storage";
import { useSaves } from "../../saves/useSaves";
import { useAppState } from "../../state/hooks";
import {
  useSelectedEnvironment,
  useSelectedMembers,
} from "../../state/selectors";
import { useToast } from "../../toast/useToast";

const NAME_LIMIT = 48;

/** Un nom déjà rempli : la première ligne du sujet, à défaut la date du jour. */
function suggestName(subject: string): string {
  const line = subject.trim().split("\n")[0]?.trim() ?? "";
  if (line === "") return `Conseil du ${formatDate(Date.now())}`;
  return line.length > NAME_LIMIT
    ? `${line.slice(0, NAME_LIMIT - 1).trimEnd()}…`
    : line;
}

export function SaveDialog({ onClose }: { readonly onClose: () => void }) {
  const state = useAppState();
  const members = useSelectedMembers();
  const environment = useSelectedEnvironment();
  const { saves, save, findByName } = useSaves();
  const toast = useToast();

  const [name, setName] = useState(() => suggestName(state.subject));
  const [error, setError] = useState<string | null>(null);

  const submit = (): void => {
    const label = name.trim();
    if (label === "") {
      setError("Donnez un nom à cette sauvegarde pour la retrouver.");
      return;
    }

    const existing = findByName(label);
    if (
      existing !== undefined &&
      !globalThis.confirm(`Remplacer la sauvegarde « ${existing.name} » ?`)
    )
      return;

    // Les fiches partent entières, pas seulement leurs noms : c'est ce qui permet
    // de rendre le conseil intact même si le catalogue a changé depuis.
    save(label, {
      username: state.username,
      members: members.map((member) => ({
        target: member.target,
        item: stripOrigin(member),
        edited: member.edited,
      })),
      environment:
        environment === null
          ? null
          : {
              target: environment.target,
              item: stripOrigin(environment),
              edited: environment.edited,
            },
      customInstructions: state.customInstructions,
      subject: state.subject,
    });
    toast(`« ${label} » est enregistré — à retrouver dans Charger`);
    onClose();
  };

  return (
    <>
      <div className="modal__head">
        <h2 id="save-title">💾 Enregistrer ce conseil</h2>
        <button
          className="modal__close"
          type="button"
          aria-label="Fermer"
          onClick={onClose}
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      <div className="modal__body modal__body--form">
        <Field
          htmlFor="save-name"
          label="Nom de la sauvegarde"
          hint="Votre nom, les fiches des membres, l'environnement, vos instructions et le sujet sont rangés dans ce navigateur. Les fiches partent entières : recharger ce conseil les rétablit telles qu'elles sont maintenant, même si vous les modifiez ou les supprimez d'ici là."
        >
          <TextField
            id="save-name"
            value={name}
            onChange={setName}
            placeholder="Conseil produit"
            onEnter={submit}
            autoFocus
          />
        </Field>
        {saves.length >= MAX_SAVES ? (
          <p className="form-field__hint">
            Vous avez atteint {MAX_SAVES} sauvegardes : la plus ancienne cédera
            sa place.
          </p>
        ) : null}
      </div>

      {error === null ? null : (
        <div className="modal__error" role="alert">
          <Notice>{error}</Notice>
        </div>
      )}

      <div className="modal__foot">
        <div className="modal__foot-left" />
        <div className="modal__foot-right">
          <Button variant="quiet" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" onClick={submit}>
            Enregistrer
          </Button>
        </div>
      </div>
    </>
  );
}
