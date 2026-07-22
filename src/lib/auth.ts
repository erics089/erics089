import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { verifyTotpToken } from "@/lib/totp";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
        otp: { label: "2FA-Code", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const otp = credentials?.otp as string | undefined;
        if (!email || !password) return null;

        const user = await db.user.findUnique({
          where: { email: email.toLowerCase().trim() },
          include: {
            memberships: { include: { agency: true } },
          },
        });
        if (!user) return null;

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) return null;

        if (user.twoFactorEnabled) {
          if (!otp) throw new Error("2FA_REQUIRED");
          if (!user.twoFactorSecret || !(await verifyTotpToken(otp, user.twoFactorSecret))) {
            throw new Error("2FA_INVALID");
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isPlatformOwner: user.isPlatformOwner,
          memberships: user.memberships.map((m) => ({
            agencyId: m.agencyId,
            agencyName: m.agency.name,
            agencySlug: m.agency.slug,
            role: m.role,
            customerId: m.customerId,
          })),
        };
      },
    }),
  ],
});
