import { CustomCard } from "../custom/CustomCard";
import { EnvironmentsCard } from "../environments/EnvironmentsCard";
import { MembersCard } from "../members/MembersCard";
import { SubjectCard } from "../subject/SubjectCard";

export function ConfigColumn() {
  return (
    <div className="config">
      <MembersCard />
      <EnvironmentsCard />
      <SubjectCard />
      <CustomCard />
    </div>
  );
}
