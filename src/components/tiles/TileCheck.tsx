/** Selection check mark: the CSS reveals it from `aria-pressed` / `aria-checked`. */
export function TileCheck() {
  return (
    <span className="tile__check" aria-hidden="true">
      ✓
    </span>
  );
}
