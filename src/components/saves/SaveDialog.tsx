import { useState } from "react";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { DialogHead } from "../ui/DialogHead";
import { Notice } from "../ui/Notice";
import { TextField } from "../ui/TextField";
import { stripOrigin } from "../../lib/library";
import { formatDate } from "../../lib/text";
import { format } from "../../locale/i18n";
import { useLocale } from "../../locale/useLocale";
import { useT } from "../../locale/useT";
import { MAX_SAVES } from "../../saves/storage";
import { useSaves } from "../../saves/useSaves";
import { useAppState } from "../../state/hooks";
import {
  useSelectedEnvironment,
  useSelectedMembers,
} from "../../state/selectors";
import { useToast } from "../../toast/useToast";

const NAME_LIMIT = 48;

export function SaveDialog({ onClose }: { readonly onClose: () => void }) {
  const state = useAppState();
  const members = useSelectedMembers();
  const environment = useSelectedEnvironment();
  const { saves, save, findByName } = useSaves();
  const toast = useToast();
  const { numberLocale } = useLocale().bundle.meta;
  const t = useT();

  /** A name filled in already: the first line of the subject, else today's date. */
  const suggestName = (subject: string): string => {
    const line = subject.trim().split("\n")[0]?.trim() ?? "";
    if (line === "")
      return format(t.saves.suggestedNamePrefix, {
        date: formatDate(Date.now(), numberLocale),
      });
    return line.length > NAME_LIMIT
      ? `${line.slice(0, NAME_LIMIT - 1).trimEnd()}…`
      : line;
  };

  const [name, setName] = useState(() => suggestName(state.subject));
  const [error, setError] = useState<string | null>(null);

  const submit = (): void => {
    const label = name.trim();
    if (label === "") {
      setError(t.saves.nameRequired);
      return;
    }

    const existing = findByName(label);
    if (
      existing !== undefined &&
      !globalThis.confirm(
        format(t.saves.replaceConfirm, { name: existing.name }),
      )
    )
      return;

    // Whole entries are stored, not just their names: that is what lets the council
    // come back intact even after the catalog has changed.
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
    toast(format(t.saves.savedToast, { name: label }));
    onClose();
  };

  return (
    <>
      <DialogHead
        id="save-title"
        title={t.saves.dialogTitle}
        onClose={onClose}
      />

      <div className="modal__body modal__body--form">
        <Field
          htmlFor="save-name"
          label={t.saves.nameLabel}
          hint={t.saves.nameHint}
        >
          <TextField
            id="save-name"
            value={name}
            onChange={setName}
            placeholder={t.saves.namePlaceholder}
            onEnter={submit}
            autoFocus
          />
        </Field>
        {saves.length >= MAX_SAVES ? (
          <p className="form-field__hint">
            {format(t.saves.maxReached, { max: MAX_SAVES })}
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
            {t.editor.cancel}
          </Button>
          <Button variant="primary" onClick={submit}>
            {t.editor.save}
          </Button>
        </div>
      </div>
    </>
  );
}
