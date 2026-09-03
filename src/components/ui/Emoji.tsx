/** Decorative pictogram: never announced by screen readers. */
export function Emoji({ glyph }: { readonly glyph: string }) {
  return <span aria-hidden="true">{glyph}</span>;
}
