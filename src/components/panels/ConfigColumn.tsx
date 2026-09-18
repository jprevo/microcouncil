import { CustomCard } from "../custom/CustomCard";
import { DynamicsCard } from "../dynamics/DynamicsCard";
import { MembersCard } from "../members/MembersCard";
import { SubjectCard } from "../subject/SubjectCard";

export function ConfigColumn() {
  return (
    <div className="config">
      <MembersCard />
      <DynamicsCard />
      <SubjectCard />
      <CustomCard />
    </div>
  );
}
