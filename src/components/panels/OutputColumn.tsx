import { OutputCard } from "../output/OutputCard";
import { SubjectCard } from "../subject/SubjectCard";

export function OutputColumn() {
  return (
    <aside className="output">
      <SubjectCard />
      <OutputCard />
    </aside>
  );
}
