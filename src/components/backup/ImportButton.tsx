import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { ImportDialog } from "./ImportDialog";
import { IconButton } from "../ui/IconButton";
import { Modal } from "../ui/Modal";
import type { Backup } from "../../backup/format";
import { readBackupFile } from "../../backup/readBackupFile";
import { useLocale } from "../../locale/useLocale";
import { useT } from "../../locale/useT";
import { useToast } from "../../toast/useToast";

export function ImportButton() {
  const input = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const { memberCatalog, environmentCatalog } = useLocale();
  const t = useT();
  /** The validated file waiting for a yes; nothing is written until then. */
  const [pending, setPending] = useState<Backup | null>(null);

  const onPick = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0];
    // The field is cleared so picking the same file twice fires the event again.
    event.target.value = "";
    if (file === undefined) return;

    // An unreadable file is turned away here: only a valid one reaches the dialog.
    const parsed = await readBackupFile(
      file,
      { memberCatalog, environmentCatalog },
      t.backup.errors,
    );
    if (parsed.ok) setPending(parsed.backup);
    else toast(parsed.reason);
  };

  return (
    <>
      <IconButton
        glyph="📥"
        label={t.backup.import.button}
        ariaLabel={t.backup.import.buttonAria}
        hasPopup
        onClick={() => input.current?.click()}
      />
      <input
        ref={input}
        type="file"
        accept="application/json,.json"
        onChange={(event) => void onPick(event)}
        hidden
      />
      <Modal
        open={pending !== null}
        labelledBy="import-title"
        onClose={() => setPending(null)}
      >
        {pending === null ? null : (
          <ImportDialog backup={pending} onClose={() => setPending(null)} />
        )}
      </Modal>
    </>
  );
}
