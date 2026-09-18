import { DynamicEditor } from "./DynamicEditor";
import { DynamicsActions } from "./DynamicsActions";
import { DynamicsGrid } from "./DynamicsGrid";
import { AddEntryButton } from "../editor/AddEntryButton";
import { useEditorModal } from "../editor/useEditorModal";
import { Card } from "../ui/Card";
import { CardHead } from "../ui/CardHead";
import { CardTitle } from "../ui/CardTitle";
import { Modal } from "../ui/Modal";
import { useT } from "../../locale/useT";
import type { CatalogDynamic } from "../../types";

const TITLE_ID = "title-dynamic";
const EDITOR_TITLE_ID = "title-dynamic-editor";

export function DynamicsCard() {
  const editor = useEditorModal<CatalogDynamic>();
  const t = useT();

  return (
    <Card labelledBy={TITLE_ID}>
      <CardHead
        title={<CardTitle id={TITLE_ID}>{t.dynamics.title}</CardTitle>}
        actions={<DynamicsActions />}
      />
      <DynamicsGrid labelledBy={TITLE_ID} onEdit={editor.edit} />
      <AddEntryButton label={t.dynamics.add} onClick={editor.create} />

      <Modal
        open={editor.open}
        labelledBy={EDITOR_TITLE_ID}
        onClose={editor.close}
      >
        {editor.open ? (
          <DynamicEditor
            dynamic={editor.entry}
            titleId={EDITOR_TITLE_ID}
            onClose={editor.close}
          />
        ) : null}
      </Modal>
    </Card>
  );
}
