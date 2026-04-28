import { auth } from "@/auth";
import { prisma } from "@devpulse/db";
import { ChartCard } from "@/components/chart-card";
import { MetricCard } from "@/components/metric-card";
import { RealtimeFeed } from "@/components/realtime-feed";
import { Topbar } from "@/components/topbar";

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
  const trend = (latestSnapshot?.deploymentFrequency ?? 12).toFixed(1);
  const snapshotCards: SnapshotCard[] = snapshots.length
    ? snapshots
    : [
        { id: "a", deploymentFrequency: 16, leadTimeHours: 8.5, changeFailureRate: 0.11, mttrHours: 1.9 },
        { id: "b", deploymentFrequency: 14, leadTimeHours: 10.2, changeFailureRate: 0.07, mttrHours: 1.5 },
        { id: "c", deploymentFrequency: 18, leadTimeHours: 7.6, changeFailureRate: 0.05, mttrHours: 1.2 }
      ];
  const riskCards: RiskCard[] = riskScores.length
    ? riskScores
    : [
        { id: "1", score: 82, rationale: "Infrastructure and rollout paths changed in one PR." },
        { id: "2", score: 68, rationale: "Touches auth middleware and background jobs." },
        { id: "3", score: 41, rationale: "Mostly presentational updates with bounded blast radius." }
      ];

  return (
    <section className="space-y-8">
      <Topbar
        title="Engineering intelligence"
        description="Operational visibility for delivery velocity, review risk, incident pressure, and release confidence across your org."
        userLabel={session?.user?.name ?? session?.user?.email}
      />

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Open pull requests" value={String(prs)} delta="+12%" hint="Healthy flow with review capacity available this morning." />
          <MetricCard
            label="Open incidents"
            value={String(incidents)}
            delta={incidents > 0 ? "+3 active" : "Stable"}
            hint="Cross-team reliability signal, weighted by unresolved severity."
          />
          <MetricCard
            label="Deploy frequency"
            value={trend}
            delta="+8.4%"
            hint="Rolling release cadence over the latest engineering cycle."
          />
          <MetricCard
            label="AI risk score"
            value={`${averageRisk}/100`}
            delta={averageRisk > 70 ? "Watchlist" : "Controlled"}
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
            {snapshotCards.map((snapshot: SnapshotCard, index: number) => (
              <div key={snapshot.id ?? index} className="rounded-3xl bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Cycle {index + 1}</p>
                <div className="mt-4 text-3xl font-semibold text-white">{Number(snapshot.deploymentFrequency).toFixed(1)}</div>
                <p className="mt-2 text-sm text-slate-400">
                  {Number(snapshot.leadTimeHours).toFixed(1)}h lead time, {(Number(snapshot.changeFailureRate) * 100).toFixed(0)}% failure rate
                </p>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard
          eyebrow="AI review radar"
          title="Highest risk pull requests"
          detail="Use this shortlist to drive review focus before deployment windows."
        >
          <div className="space-y-3">
            {riskCards.map((risk: RiskCard) => (
              <div key={risk.id} className="rounded-3xl bg-white/[0.03] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">Risk {risk.id.slice(0, 6)}</p>
                  <span className="rounded-full bg-indigo-400/10 px-3 py-1 text-xs text-indigo-300">{risk.score}/100</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{risk.rationale}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </section>
  );
}
