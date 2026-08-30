export function TileIcon({ icon }: { readonly icon: string }) {
  return (
    <span className="tile__icon" aria-hidden="true">
      {icon}
    </span>
  );
}
