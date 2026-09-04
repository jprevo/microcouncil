import { useMemo, useState } from "react";
import { MemberEditor } from "./MemberEditor";
import { MembersActions } from "./MembersActions";
import { MembersCount } from "./MembersCount";
import { MembersFilter } from "./MembersFilter";
import { MembersGrid } from "./MembersGrid";
import { AddEntryButton } from "../editor/AddEntryButton";
import { useEditorModal } from "../editor/useEditorModal";
import { Card } from "../ui/Card";
import { CardHead } from "../ui/CardHead";
import { CardHint } from "../ui/CardHint";
import { CardTitle } from "../ui/CardTitle";
import { Modal } from "../ui/Modal";
import { filterMembers } from "../../lib/search";
import { useT } from "../../locale/useT";
import { useMemberCatalog } from "../../state/selectors";
import type { CatalogMember } from "../../types";

const EDITOR_TITLE_ID = "title-member-editor";

export function MembersCard() {
  const [query, setQuery] = useState("");
  const catalog = useMemberCatalog();
  const visible = useMemo(
    () => filterMembers(catalog, query),
    [catalog, query],
  );
  const editor = useEditorModal<CatalogMember>();
  const t = useT();

  return (
    <Card labelledBy="title-members">
      <CardHead actions={<MembersActions />}>
        <CardTitle id="title-members">
          {t.members.title} <MembersCount />
        </CardTitle>
        <CardHint>{t.members.hint}</CardHint>
      </CardHead>
      <MembersFilter query={query} onChange={setQuery} />
      <MembersGrid members={visible} onEdit={editor.edit} />
      <AddEntryButton label={t.members.add} onClick={editor.create} />

      <Modal
        open={editor.open}
        labelledBy={EDITOR_TITLE_ID}
        onClose={editor.close}
      >
        {editor.open ? (
          <MemberEditor
            member={editor.entry}
            titleId={EDITOR_TITLE_ID}
            onClose={editor.close}
          />
        ) : null}
      </Modal>
    </Card>
  );
}
