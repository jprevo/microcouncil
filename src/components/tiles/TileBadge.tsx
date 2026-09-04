/** Origin badge on an entry: `t.tiles.added` or `t.tiles.modified`. */
export function TileBadge({ children }: { readonly children: string }) {
  return <span className="tile__badge">{children}</span>;
}
