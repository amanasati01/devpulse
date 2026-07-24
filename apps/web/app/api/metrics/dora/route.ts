import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@devpulse/db";
import { cacheAside, orgScopedKey } from "@devpulse/lib/src/redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PullRequestRecord = Awaited<ReturnType<typeof prisma.pullRequest.findMany>>[number];
type IncidentRecord = Awaited<ReturnType<typeof prisma.incident.findMany>>[number];

export async function GET() {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = session.user.orgId;
  const key = orgScopedKey(orgId, "dora");

  const result = await cacheAside(key, 60, async () => {
    const prs: PullRequestRecord[] = await prisma.pullRequest.findMany({ where: { orgId } });
    const incidents: IncidentRecord[] = await prisma.incident.findMany({ where: { orgId } });
    const merged = prs.filter((pr: PullRequestRecord) => !!pr.mergedAt);
    const deploymentFrequency = merged.length;
    const leadTimeHours =
      merged.reduce((acc: number, pr: PullRequestRecord) => {
        if (!pr.mergedAt) return acc;
        return acc + (pr.mergedAt.getTime() - pr.createdAt.getTime()) / (1000 * 60 * 60);
      }, 0) / Math.max(merged.length, 1);
    const changeFailureRate =
      incidents.length === 0 ? 0 : Math.min(1, incidents.length / Math.max(merged.length, 1));
    const mttrHours =
      incidents.reduce((acc: number, i: IncidentRecord) => {
        if (!i.resolvedAt) return acc;
        return acc + (i.resolvedAt.getTime() - i.startedAt.getTime()) / (1000 * 60 * 60);
      }, 0) / Math.max(incidents.filter((i: IncidentRecord) => i.resolvedAt).length, 1);

    return { deploymentFrequency, leadTimeHours, changeFailureRate, mttrHours };
  });

  return NextResponse.json(result);
}
