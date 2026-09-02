import { Brand } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";
import { LoadButton } from "../saves/LoadButton";
import { SaveButton } from "../saves/SaveButton";

export function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Brand />
        {/* Les deux gestes sur le conseil vont ensemble ; le thème est d'un autre ordre. */}
        <div className="topbar__actions">
          <SaveButton />
          <LoadButton />
          <span className="topbar__divider" aria-hidden="true" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
