/** Pictogramme décoratif : jamais annoncé par les lecteurs d'écran. */
export function Emoji({ glyph }: { readonly glyph: string }) {
  return <span aria-hidden="true">{glyph}</span>;
}
