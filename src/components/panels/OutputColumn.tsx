import { IdentityCard } from "../identity/IdentityCard";
import { OutputCard } from "../output/OutputCard";

/** Who is asking, what about, and the prompt that comes out of it. */
export function OutputColumn() {
  return (
    <aside className="output">
      <IdentityCard />
      <OutputCard />
    </aside>
  );
}
