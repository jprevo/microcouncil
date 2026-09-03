import { Brand } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";
import { LoadButton } from "../saves/LoadButton";
import { SaveButton } from "../saves/SaveButton";

export function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Brand />
        {/* The two council actions belong together; the theme is a different kind of thing. */}
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
