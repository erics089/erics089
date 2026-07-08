import { repository } from "@/lib/repository";
import { AppHeader } from "@/components/layout/AppHeader";
import { SettingsView } from "./SettingsView";

export default async function SettingsPage() {
  const user = await repository.getCurrentUser();
  return (
    <>
      <AppHeader title="Settings" back />
      <SettingsView user={user} />
    </>
  );
}
