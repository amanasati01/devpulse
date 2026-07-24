import { auth } from "@/auth";
import { prisma } from "@devpulse/db";
import { ChartCard } from "@/components/chart-card";
import { MetricCard } from "@/components/metric-card";
import { RealtimeFeed } from "@/components/realtime-feed";
import { Topbar } from "@/components/topbar";

export const dynamic = "force-dynamic";

type SnapshotCard = {
  id?: string;
  deploymentFrequency: number;
  leadTimeHours: number;
  changeFailureRate: number;
  mttrHours?: number;
};

type RiskCard = {
  id: string;
  score: number;
  rationale: string;
};

export default async function DashboardPage() {
  const session = await auth();
  const orgId = session!.user.orgId;
  const [prs, incidents, snapshots, riskScores] = await Promise.all([
    prisma.pullRequest.count({ where: { orgId } }),
    prisma.incident.count({ where: { orgId, status: "open" } }),
    prisma.doraSnapshot.findMany({ where: { orgId }, orderBy: { capturedAt: "desc" }, take: 6 }),
    prisma.riskScore.findMany({ where: { orgId }, orderBy: { updatedAt: "desc" }, take: 5 })
  ]);
  const latestSnapshot = snapshots[0];
  const averageRisk = riskScores.length
    ? Math.round(riskScores.reduce((sum: number, item: RiskCard) => sum + item.score, 0) / riskScores.length)
    : 64;
  const trend = latestSnapshot?.deploymentFrequency ? latestSnapshot.deploymentFrequency.toFixed(1) : "N/A";
  const snapshotCards: SnapshotCard[] = snapshots;
  const riskCards: RiskCard[] = riskScores;

  return (
    <section className="space-y-8">
      <Topbar
        title="Engineering intelligence"
        description="Operational visibility for delivery velocity, review risk, incident pressure, and release confidence across your org."
        userLabel={session?.user?.name ?? session?.user?.email}
      />

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Open pull requests" value={String(prs)} delta={prs > 0 ? "Active" : "-"} hint="Healthy flow with review capacity available this morning." />
          <MetricCard
            label="Open incidents"
            value={String(incidents)}
            delta={incidents > 0 ? `${incidents} active` : "-"}
            hint="Cross-team reliability signal, weighted by unresolved severity."
          />
          <MetricCard
            label="Deploy frequency"
            value={trend}
            delta="-"
            hint="Rolling release cadence over the latest engineering cycle."
          />
          <MetricCard
            label="AI risk score"
            value={riskScores.length ? `${averageRisk}/100` : "N/A"}
            delta={riskScores.length && averageRisk > 70 ? "Watchlist" : "-"}
            hint="Model-estimated delivery risk across your newest pull requests."
            highlight
          />
        </div>
        <RealtimeFeed />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
        <ChartCard
          eyebrow="Delivery pulse"
          title="Execution trend"
          detail="Lead time, merge velocity, and change stability synthesized from DORA snapshots."
        >
          <div className="grid gap-3 md:grid-cols-3">
            {snapshotCards.length > 0 ? (
              snapshotCards.map((snapshot: SnapshotCard, index: number) => (
                <div key={snapshot.id ?? index} className="rounded-3xl bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Cycle {index + 1}</p>
                  <div className="mt-4 text-3xl font-semibold text-white">{Number(snapshot.deploymentFrequency).toFixed(1)}</div>
                  <p className="mt-2 text-sm text-slate-400">
                    {Number(snapshot.leadTimeHours).toFixed(1)}h lead time, {(Number(snapshot.changeFailureRate) * 100).toFixed(0)}% failure rate
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-4 text-sm text-slate-500">No DORA snapshots captured yet.</div>
            )}
          </div>
        </ChartCard>

        <ChartCard
          eyebrow="AI review radar"
          title="Highest risk pull requests"
          detail="Use this shortlist to drive review focus before deployment windows."
        >
          <div className="space-y-3">
            {riskCards.length > 0 ? (
              riskCards.map((risk: RiskCard) => (
                <div key={risk.id} className="rounded-3xl bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">Risk {risk.id.slice(0, 6)}</p>
                    <span className="rounded-full bg-indigo-400/10 px-3 py-1 text-xs text-indigo-300">{risk.score}/100</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{risk.rationale}</p>
                </div>
              ))
            ) : (
              <div className="py-4 text-sm text-slate-500">No PRs have been scored by AI yet.</div>
            )}
          </div>
        </ChartCard>
      </div>
    </section>
  );
}
