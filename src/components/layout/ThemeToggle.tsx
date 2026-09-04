import { IconButton } from "../ui/IconButton";
import { useTheme } from "../../state/useTheme";
import { useT } from "../../locale/useT";

/**
 * A switch, named for the state it turns on and marked with `aria-pressed` for
 * whether it is on — the pattern a screen reader already knows how to read out
 * and re-read after a press. A button whose name flips between "go dark" and "go
 * light" instead says nothing at the moment it is pressed, which is the one
 * moment that matters.
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const t = useT();
  const dark = theme === "dark";

  return (
    <IconButton
      glyph={dark ? "☀️" : "🌙"}
      label={t.theme.label}
      ariaLabel={t.theme.label}
      pressed={dark}
      onClick={toggle}
      iconOnly
    />
  );
}
