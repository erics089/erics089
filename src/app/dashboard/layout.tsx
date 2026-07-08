import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { UserMenu } from "@/components/user-menu";

const ROLE_LABELS: Record<string, string> = {
  AGENCY_ADMIN: "Agentur-Admin",
  PROJECT_MANAGER: "Projektleiter",
  STAFF: "Mitarbeiter",
  ACCOUNTING: "Buchhaltung",
  CLIENT: "Kunde",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const membership = session.user.memberships?.[0];
  const agencyName = session.user.isPlatformOwner
    ? "Plattform-Owner"
    : membership?.agencyName ?? "AGENTUR-OS";
  const roleLabel = session.user.isPlatformOwner
    ? "Owner"
    : ROLE_LABELS[membership?.role ?? ""] ?? membership?.role ?? "";

  return (
    <div className="flex h-screen w-full">
      <AppSidebar agencyName={agencyName} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-end border-b px-6">
          <UserMenu
            name={session.user.name ?? session.user.email ?? ""}
            email={session.user.email ?? ""}
            role={roleLabel}
          />
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
