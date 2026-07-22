import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MODULES } from "@/lib/modules";

export default async function DashboardOverviewPage() {
  const session = await auth();
  const agencyId = session?.user.memberships?.[0]?.agencyId;

  const customerCount = agencyId
    ? await db.customer.count({ where: { agencyId } })
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Willkommen zurück, {session?.user.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          {customerCount} Kunde{customerCount === 1 ? "" : "n"} in deiner Agentur hinterlegt.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((mod) => (
          <Link key={mod.key} href={`/dashboard/${mod.slug}`}>
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardHeader>
                <CardTitle className="text-base">{mod.label}</CardTitle>
                <CardDescription>{mod.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
