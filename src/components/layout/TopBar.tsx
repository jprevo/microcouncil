import { Brand } from './Brand';
import { ThemeToggle } from './ThemeToggle';
import { SkillHelp } from '../skill/SkillHelp';

export function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Brand />
        <div className="topbar__actions">
          <SkillHelp />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
