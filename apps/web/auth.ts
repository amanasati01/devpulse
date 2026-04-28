import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { prisma } from "@devpulse/db";

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

if (!githubClientId || !githubClientSecret) {
  throw new Error("Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    GitHub({
      clientId: githubClientId,
      clientSecret: githubClientSecret,
      allowDangerousEmailAccountLinking: true,
      authorization: { params: { scope: "read:user user:email repo" } }
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "github" && profile) {
        const githubId = String(profile.id);
        const email = token.email ?? `${githubId}@users.noreply.github.com`;
        const orgSlug = `org-${githubId}`;
        let org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
        if (!org) {
          org = await prisma.organization.create({
            data: { name: `${profile.name ?? "DevPulse"} Org`, slug: orgSlug }
          });
        }
        await prisma.user.upsert({
          where: { githubId },
          update: {
            orgId: org.id,
            githubToken: account.access_token,
            name: (profile.name as string | undefined) ?? null,
            avatarUrl: (profile.avatar_url as string | undefined) ?? null
          },
          create: {
            orgId: org.id,
            githubId,
            email,
            githubToken: account.access_token,
            name: (profile.name as string | undefined) ?? null,
            avatarUrl: (profile.avatar_url as string | undefined) ?? null
          }
        });
        token.orgId = org.id;
        token.githubAccessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.orgId = token.orgId as string;
        session.user.githubAccessToken = token.githubAccessToken as string | undefined;
      }
      return session;
    }
  }
});
