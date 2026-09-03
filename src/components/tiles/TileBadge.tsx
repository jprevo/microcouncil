/** Origin badge on an entry: "ajouté" or "modifié". */
export function TileBadge({ children }: { readonly children: string }) {
  return <span className="tile__badge">{children}</span>;
}
