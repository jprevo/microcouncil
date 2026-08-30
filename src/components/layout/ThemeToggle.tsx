import { useTheme } from '../../state/useTheme';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const goingDark = theme === 'light';

  return (
    <button
      className="icon-button"
      type="button"
      aria-live="polite"
      aria-label={goingDark ? 'Passer au thème sombre' : 'Passer au thème clair'}
      onClick={toggle}
    >
      <span aria-hidden="true">{goingDark ? '🌙' : '☀️'}</span>
      <span>{goingDark ? 'Thème sombre' : 'Thème clair'}</span>
    </button>
  );
}
