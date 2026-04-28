import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@devpulse/db";
import { cacheAside, orgScopedKey } from "@devpulse/lib/src/redis";

export async function GET() {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = session.user.orgId;
  const key = orgScopedKey(orgId, "dora");

  const result = await cacheAside(key, 60, async () => {
    const prs = await prisma.pullRequest.findMany({ where: { orgId } });
    const incidents = await prisma.incident.findMany({ where: { orgId } });
    const merged = prs.filter((pr) => !!pr.mergedAt);
    const deploymentFrequency = merged.length;
    const leadTimeHours =
      merged.reduce((acc, pr) => {
        if (!pr.mergedAt) return acc;
        return acc + (pr.mergedAt.getTime() - pr.createdAt.getTime()) / (1000 * 60 * 60);
      }, 0) / Math.max(merged.length, 1);
    const changeFailureRate =
      incidents.length === 0 ? 0 : Math.min(1, incidents.length / Math.max(merged.length, 1));
    const mttrHours =
      incidents.reduce((acc, i) => {
        if (!i.resolvedAt) return acc;
        return acc + (i.resolvedAt.getTime() - i.startedAt.getTime()) / (1000 * 60 * 60);
      }, 0) / Math.max(incidents.filter((i) => i.resolvedAt).length, 1);

    return { deploymentFrequency, leadTimeHours, changeFailureRate, mttrHours };
  });

  return NextResponse.json(result);
}
