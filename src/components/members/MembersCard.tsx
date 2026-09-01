import { useMemo, useState } from "react";
import { AddMemberButton } from "./AddMemberButton";
import { MemberEditor } from "./MemberEditor";
import { MembersActions } from "./MembersActions";
import { MembersCount } from "./MembersCount";
import { MembersFilter } from "./MembersFilter";
import { MembersGrid } from "./MembersGrid";
import { useMemberEditor } from "./useMemberEditor";
import { Card } from "../ui/Card";
import { CardHead } from "../ui/CardHead";
import { CardHint } from "../ui/CardHint";
import { CardTitle } from "../ui/CardTitle";
import { Modal } from "../ui/Modal";
import { filterMembers } from "../../lib/search";
import { useCatalog } from "../../state/selectors";

const EDITOR_TITLE_ID = "title-member-editor";

export function MembersCard() {
  const [query, setQuery] = useState("");
  const catalog = useCatalog();
  const visible = useMemo(
    () => filterMembers(catalog, query),
    [catalog, query],
  );
  const editor = useMemberEditor();

  return (
    <Card labelledBy="title-members">
      <CardHead actions={<MembersActions />}>
        <CardTitle id="title-members">
          Les membres du conseil <MembersCount />
        </CardTitle>
        <CardHint>Idéalement entre 3 et 7 membres.</CardHint>
      </CardHead>
      <MembersFilter query={query} onChange={setQuery} />
      <MembersGrid members={visible} onEdit={editor.edit} />
      <AddMemberButton onClick={editor.create} />

      <Modal
        open={editor.open}
        labelledBy={EDITOR_TITLE_ID}
        onClose={editor.close}
      >
        {editor.open ? (
          <MemberEditor
            member={editor.member}
            titleId={EDITOR_TITLE_ID}
            onClose={editor.close}
          />
        ) : null}
      </Modal>
    </Card>
  );
}
