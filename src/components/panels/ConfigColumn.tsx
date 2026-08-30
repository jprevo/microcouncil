import { CustomCard } from '../custom/CustomCard';
import { EnvironmentsCard } from '../environments/EnvironmentsCard';
import { IdentityCard } from '../identity/IdentityCard';
import { MembersCard } from '../members/MembersCard';

export function ConfigColumn() {
  return (
    <div className="config">
      <IdentityCard />
      <MembersCard />
      <EnvironmentsCard />
      <CustomCard />
    </div>
  );
}
