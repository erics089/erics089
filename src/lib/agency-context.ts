import { auth } from "@/lib/auth";

/// Liefert die erste Agentur-Mitgliedschaft der eingeloggten Session.
/// Phase-1-Vereinfachung: Nutzer mit mehreren Agentur-Mitgliedschaften
/// (selten, z.B. externe Dienstleister) sehen nur ihre erste Agentur —
/// ein Agentur-Switcher ist nicht Teil dieser Phase.
export async function getAgencyContext() {
  const session = await auth();
  const membership = session?.user.memberships?.[0];
  if (!session?.user || !membership) return null;

  return {
    userId: session.user.id,
    agencyId: membership.agencyId,
    role: membership.role,
  };
}
