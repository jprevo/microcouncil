import { IconButton } from "../ui/IconButton";
import { useTheme } from "../../state/useTheme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const goingDark = theme === "light";

  return (
    <IconButton
      glyph={goingDark ? "🌙" : "☀️"}
      label={goingDark ? "Passer au thème sombre" : "Passer au thème clair"}
      onClick={toggle}
      iconOnly
      live
    />
  );
}
