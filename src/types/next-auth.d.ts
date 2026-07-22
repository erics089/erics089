import type { DefaultSession } from "next-auth";

export type SessionMembership = {
  agencyId: string;
  agencyName: string;
  agencySlug: string;
  role: string;
  customerId: string | null;
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isPlatformOwner: boolean;
      memberships: SessionMembership[];
    } & DefaultSession["user"];
  }

  interface User {
    isPlatformOwner?: boolean;
    memberships?: SessionMembership[];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    isPlatformOwner: boolean;
    memberships: SessionMembership[];
  }
}
