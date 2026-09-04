import { BackupActions } from "../backup/BackupActions";
import { SkillHelp } from "../skill/SkillHelp";
import { useT } from "../../locale/useT";

export function Footer() {
  const t = useT();
  const [before, after] = t.footer.license.split("{github}");

  return (
    <footer className="footer">
      <div className="footer__actions">
        <SkillHelp />
        <BackupActions />
      </div>
      <p>
        {before}
        <a
          className="footer-link"
          href="https://github.com/jprevo/microcouncil"
          target="_blank"
          rel="noreferrer"
        >
          {t.footer.githubLinkText}
        </a>
        {after}
      </p>
      <p>{t.footer.privacy}</p>
    </footer>
  );
}
