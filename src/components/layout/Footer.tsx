import type { ReactNode } from "react";
import { LocalePicker } from "./LocalePicker";
import { ExportButton } from "../backup/ExportButton";
import { ImportButton } from "../backup/ImportButton";
import { SkillHelp } from "../skill/SkillHelp";
import { REPO_URL } from "../../lib/links";
import { useT } from "../../locale/useT";

function RepoLink({ children }: { readonly children: ReactNode }) {
  return (
    <a className="footer-link" href={REPO_URL} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

export function Footer() {
  const t = useT();
  const links: Readonly<Record<string, string>> = {
    openSource: t.footer.openSourceLinkText,
    star: t.footer.starLinkText,
  };
  // Every odd part of the split is the name of a placeholder, and becomes its link.
  const support = t.footer.support
    .split(/\{(\w+)\}/)
    .map((part, index) =>
      index % 2 === 0 ? part : <RepoLink key={part}>{links[part]}</RepoLink>,
    );

  return (
    <footer className="footer">
      <div className="footer__actions">
        <SkillHelp />
      </div>
      <p>{t.footer.copyright}</p>
      <p>{support}</p>
      <div className="footer__links">
        <LocalePicker />
        <span aria-hidden="true">·</span>
        <ExportButton />
        <span aria-hidden="true">·</span>
        <ImportButton />
      </div>
      <p>{t.footer.privacy}</p>
    </footer>
  );
}
