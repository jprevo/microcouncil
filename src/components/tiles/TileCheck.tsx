/** Coche d'état : le CSS l'affiche selon `aria-pressed` / `aria-checked`. */
export function TileCheck() {
  return (
    <span className="tile__check" aria-hidden="true">
      ✓
    </span>
  );
}
