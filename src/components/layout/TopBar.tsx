import { Brand } from "./Brand";
import { GitHubStar } from "./GitHubStar";
import { ThemeToggle } from "./ThemeToggle";
import { LoadButton } from "../saves/LoadButton";
import { SaveButton } from "../saves/SaveButton";

export function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Brand />
        {/*
          The two council actions belong together; the star and the theme are about
          the site rather than the council, so a rule sets them apart.
        */}
        <div className="topbar__actions">
          <SaveButton />
          <LoadButton />
          <span className="topbar__divider" aria-hidden="true" />
          <GitHubStar />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
