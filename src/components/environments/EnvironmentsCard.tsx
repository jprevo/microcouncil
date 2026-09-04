import { EnvironmentEditor } from "./EnvironmentEditor";
import { EnvironmentsActions } from "./EnvironmentsActions";
import { EnvironmentsGrid } from "./EnvironmentsGrid";
import { AddEntryButton } from "../editor/AddEntryButton";
import { useEditorModal } from "../editor/useEditorModal";
import { Card } from "../ui/Card";
import { CardHead } from "../ui/CardHead";
import { CardHint } from "../ui/CardHint";
import { CardTitle } from "../ui/CardTitle";
import { Modal } from "../ui/Modal";
import { useT } from "../../locale/useT";
import type { CatalogEnvironment } from "../../types";

const TITLE_ID = "title-environment";
const EDITOR_TITLE_ID = "title-environment-editor";

export function EnvironmentsCard() {
  const editor = useEditorModal<CatalogEnvironment>();
  const t = useT();

  return (
    <Card labelledBy={TITLE_ID}>
      <CardHead actions={<EnvironmentsActions />}>
        <CardTitle id={TITLE_ID}>{t.environments.title}</CardTitle>
        <CardHint>{t.environments.hint}</CardHint>
      </CardHead>
      <EnvironmentsGrid labelledBy={TITLE_ID} onEdit={editor.edit} />
      <AddEntryButton label={t.environments.add} onClick={editor.create} />

      <Modal
        open={editor.open}
        labelledBy={EDITOR_TITLE_ID}
        onClose={editor.close}
      >
        {editor.open ? (
          <EnvironmentEditor
            environment={editor.entry}
            titleId={EDITOR_TITLE_ID}
            onClose={editor.close}
          />
        ) : null}
      </Modal>
    </Card>
  );
}
