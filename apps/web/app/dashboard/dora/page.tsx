import { auth } from "@/auth";
import { prisma } from "@devpulse/db";
import { DoraChart } from "@/components/dora-chart";
import { MetricCard } from "@/components/metric-card";
import { Topbar } from "@/components/topbar";

export default async function DoraPage() {
  const session = await auth();
  const rows = await prisma.doraSnapshot.findMany({
    where: { orgId: session!.user.orgId },
    orderBy: { capturedAt: "desc" },
    take: 20
  });
  type DoraSnapshotRow = (typeof rows)[number];
  const latest = rows[0];

  return (
    <section className="space-y-8">
      <Topbar
        title="DORA metrics"
        description="Measure release performance, recovery speed, and delivery consistency with a board-ready operational view."
        userLabel={session?.user?.name ?? session?.user?.email}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Deploy frequency" value={latest ? latest.deploymentFrequency.toFixed(1) : "16.0"} delta="+6.2%" hint="Average releases per cycle" />
        <MetricCard label="Lead time" value={latest ? `${latest.leadTimeHours.toFixed(1)}h` : "8.4h"} delta="-12%" hint="Commit to production latency" />
        <MetricCard label="Change failure rate" value={latest ? `${(latest.changeFailureRate * 100).toFixed(0)}%` : "7%"} delta="-2 pts" hint="Stable releases with lower rollback exposure" />
        <MetricCard label="MTTR" value={latest ? `${latest.mttrHours.toFixed(1)}h` : "1.4h"} delta="-18%" hint="Faster recovery on incidents" />
      </div>
      <DoraChart
        data={rows
          .slice()
          .reverse()
          .map((row: DoraSnapshotRow) => ({
            capturedAt: row.capturedAt.toISOString(),
            deploymentFrequency: row.deploymentFrequency,
            leadTimeHours: row.leadTimeHours
          }))}
      />
    </section>
  );
}
