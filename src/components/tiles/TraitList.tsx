export function TraitList({ traits }: { readonly traits: readonly string[] }) {
  if (traits.length === 0) return null;
  return (
    <span className="tile__traits">
      {traits.map((trait) => (
        <span className="trait" key={trait}>
          {trait}
        </span>
      ))}
    </span>
  );
}
