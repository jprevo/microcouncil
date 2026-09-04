import { CommandBlock } from "./CommandBlock";
import { DialogHead } from "../ui/DialogHead";
import { InlineCode } from "../ui/InlineCode";
import { useT } from "../../locale/useT";

export function SkillGuide({ onClose }: { readonly onClose: () => void }) {
  const t = useT();
  const s = t.skill;

  return (
    <>
      <DialogHead id="skill-title" title={s.title} onClose={onClose} />

      <div className="modal__body">
        <p className="modal__lede">{s.intro}</p>

        <section className="modal__section">
          <h3>{s.overviewTitle}</h3>
          <ul className="modal__list">
            <li>{s.overviewBullet1}</li>
            <li>{s.overviewBullet2}</li>
            <li>{s.overviewBullet3}</li>
          </ul>
        </section>

        <section className="modal__section">
          <h3>{s.hermesTitle}</h3>
          <p>{s.hermesChatIntro}</p>
          <CommandBlock command={s.installCommand} />
          <p>{s.hermesCliIntro}</p>
          <CommandBlock command={s.hermesCliCommand} />
        </section>

        <section className="modal__section">
          <h3>{s.claudeCodeTitle}</h3>
          <p>{s.claudeCodeChatIntro}</p>
          <CommandBlock command={s.claudeInstallCommand} />
          <p>{s.claudeCodeInvokeIntro}</p>
          <CommandBlock command={s.claudeCodeCommand} />
        </section>

        <p className="modal__note">
          <InlineCode text={s.note} />
        </p>
      </div>
    </>
  );
}
