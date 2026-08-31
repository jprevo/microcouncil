/** Pastille d'origine d'une fiche : « ajouté » ou « modifié ». */
export function TileBadge({ children }: { readonly children: string }) {
  return <span className="tile__badge">{children}</span>;
}
