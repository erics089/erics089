import type { NextAuthConfig } from "next-auth";

/// Edge-taugliche Basis-Konfiguration (kein DB-Zugriff!) — wird von der
/// Middleware genutzt. Die vollständige Konfiguration inkl. Credentials
/// Provider lebt in `auth.ts` und läuft nur in der Node.js-Runtime.
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.isPlatformOwner = user.isPlatformOwner ?? false;
        token.memberships = user.memberships ?? [];
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.isPlatformOwner = token.isPlatformOwner;
        session.user.memberships = token.memberships;
      }
      return session;
    },
  },
};
