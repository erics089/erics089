import { repository } from "@/lib/repository";
import { AppHeader } from "@/components/layout/AppHeader";
import { RoadView } from "./RoadView";

export default async function RoadPage() {
  const goals = await repository.getGoals();
  return (
    <>
      <AppHeader title="Road to Glory" />
      <RoadView goals={goals} />
    </>
  );
}
