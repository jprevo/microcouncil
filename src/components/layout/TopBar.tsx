import { Brand } from './Brand';
import { ThemeToggle } from './ThemeToggle';

export function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Brand />
        <ThemeToggle />
      </div>
    </header>
  );
}
