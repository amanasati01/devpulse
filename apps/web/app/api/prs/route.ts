import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@devpulse/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const prs = await prisma.pullRequest.findMany({
    where: { orgId: session.user.orgId },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(prs);
}
