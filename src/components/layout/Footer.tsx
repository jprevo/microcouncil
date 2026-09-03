import { BackupActions } from "../backup/BackupActions";
import { SkillHelp } from "../skill/SkillHelp";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__actions">
        <SkillHelp />
        <BackupActions />
      </div>
      <p>
        © 2026 Micro Council · Projet open source disponible sur{" "}
        <a
          className="footer-link"
          href="https://github.com/jprevo/microcouncil"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </p>
      <p>
        Aucun cookie n'est utilisé. Vos réglages ne quittent jamais votre
        navigateur.
      </p>
    </footer>
  );
}
