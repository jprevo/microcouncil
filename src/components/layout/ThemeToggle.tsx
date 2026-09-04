import { IconButton } from "../ui/IconButton";
import { useTheme } from "../../state/useTheme";
import { useT } from "../../locale/useT";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const t = useT();
  const goingDark = theme === "light";

  return (
    <IconButton
      glyph={goingDark ? "🌙" : "☀️"}
      label={goingDark ? t.theme.toDark : t.theme.toLight}
      onClick={toggle}
      iconOnly
      live
    />
  );
}
