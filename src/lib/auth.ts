import "server-only";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { isReservedUsername } from "@/lib/usernames";

async function availableUsername(email: string) {
  const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 24) || "listener";
  let candidate = isReservedUsername(base) ? `${base}-creator` : base;
  for (let i = 0; i < 10; i += 1) {
    const existing = await prisma.user.findUnique({ where: { username: candidate }, select: { id: true } });
    if (!existing) return candidate;
    candidate = `${base}-${Math.random().toString(36).slice(2, 7)}`;
  }
  throw new Error("Could not allocate username");
}

export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({ clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return false;
      const email = user.email?.trim().toLowerCase();
      if (!email) return false;
      const existing = await prisma.user.findUnique({ where: { email } });
      if (!existing) {
        await prisma.user.create({
          data: {
            email,
            username: await availableUsername(email),
            displayName: user.name?.trim() || email.split("@")[0],
            profileImage: user.image,
            emailVerified: new Date(),
            onboardingComplete: false,
          },
        });
      } else if (!existing.emailVerified) {
        await prisma.user.update({ where: { id: existing.id }, data: { emailVerified: new Date() } });
      }
      return true;
    },
    async jwt({ token, user }) {
      const email = user?.email ?? token.email;
      if (email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: { id: true, role: true, username: true, onboardingComplete: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.username = dbUser.username;
          token.onboardingComplete = dbUser.onboardingComplete;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.onboardingComplete = token.onboardingComplete;
      }
      return session;
    },
  },
};
