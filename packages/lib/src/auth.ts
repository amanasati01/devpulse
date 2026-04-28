import { auth } from "next-auth";

export async function requireSession() {
  const session = await auth();
  if (!session?.user || !session.user.orgId) {
    throw new Error("Unauthorized");
  }
  return session;
}
