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
import { Status } from "../ui/Status";
import { filterMembers } from "../../lib/search";
import { format, pluralizeZero } from "../../locale/i18n";
import { useLocale } from "../../locale/useLocale";
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
  const { numberLocale } = useLocale().bundle.meta;
  const t = useT();

  return (
    <Card labelledBy="title-members">
      <CardHead
        title={
          <CardTitle id="title-members">
            {t.members.title} <MembersCount />
          </CardTitle>
        }
        hint={<CardHint>{t.members.hint}</CardHint>}
        actions={<MembersActions />}
      />
      <MembersFilter query={query} onChange={setQuery} />
      {/* Filtering rearranges the page in silence otherwise. */}
      <Status>
        {format(
          pluralizeZero(visible.length, t.members.filterStatus, numberLocale),
          { count: visible.length },
        )}
      </Status>
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
