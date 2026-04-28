import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      orgId: string;
      githubAccessToken?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    orgId?: string;
    githubAccessToken?: string;
  }
}
