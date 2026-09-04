import { ExportButton } from "../backup/ExportButton";
import { ImportButton } from "../backup/ImportButton";
import { SkillHelp } from "../skill/SkillHelp";
import { useT } from "../../locale/useT";

export function Footer() {
  const t = useT();
  const [before, after] = t.footer.license.split("{github}");

  return (
    <footer className="footer">
      <div className="footer__actions">
        <SkillHelp />
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
      <div className="footer__links">
        <ExportButton />
        <span aria-hidden="true">·</span>
        <ImportButton />
      </div>
      <p>{t.footer.privacy}</p>
    </footer>
  );
}
