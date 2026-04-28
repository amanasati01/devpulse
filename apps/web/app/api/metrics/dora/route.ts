import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma, type Incident, type PullRequest } from "@devpulse/db";
import { cacheAside, orgScopedKey } from "@devpulse/lib/src/redis";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = session.user.orgId;
  const key = orgScopedKey(orgId, "dora");

  const result = await cacheAside(key, 60, async () => {
    const prs: PullRequest[] = await prisma.pullRequest.findMany({ where: { orgId } });
    const incidents: Incident[] = await prisma.incident.findMany({ where: { orgId } });
    const merged = prs.filter((pr: PullRequest) => !!pr.mergedAt);
    const deploymentFrequency = merged.length;
    const leadTimeHours =
      merged.reduce((acc: number, pr: PullRequest) => {
        if (!pr.mergedAt) return acc;
        return acc + (pr.mergedAt.getTime() - pr.createdAt.getTime()) / (1000 * 60 * 60);
      }, 0) / Math.max(merged.length, 1);
    const changeFailureRate =
      incidents.length === 0 ? 0 : Math.min(1, incidents.length / Math.max(merged.length, 1));
    const mttrHours =
      incidents.reduce((acc: number, i: Incident) => {
        if (!i.resolvedAt) return acc;
        return acc + (i.resolvedAt.getTime() - i.startedAt.getTime()) / (1000 * 60 * 60);
      }, 0) / Math.max(incidents.filter((i: Incident) => i.resolvedAt).length, 1);

    return { deploymentFrequency, leadTimeHours, changeFailureRate, mttrHours };
  });

  return NextResponse.json(result);
}
