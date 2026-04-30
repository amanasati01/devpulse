import { DoraChart } from "@/components/dora-chart";
import { MetricCard } from "@/components/metric-card";
import { Topbar } from "@/components/topbar";

export default function DemoDoraPage() {
  const latest = {
    deploymentFrequency: 14.5,
    leadTimeHours: 6.2,
    changeFailureRate: 0.04,
    mttrHours: 1.1
  };

  const rows = Array.from({ length: 20 }, (_, i) => ({
    capturedAt: new Date(Date.now() - i * 86400000).toISOString(),
    deploymentFrequency: 12 + Math.random() * 5,
    leadTimeHours: 5 + Math.random() * 3,
    changeFailureRate: 0.02 + Math.random() * 0.05,
    mttrHours: 0.8 + Math.random() * 1.5
  }));

  return (
    <section className="space-y-8">
      <Topbar
        title="DORA metrics"
        description="Measure release performance, recovery speed, and delivery consistency with a board-ready operational view."
        userLabel="Guest"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Deploy frequency" value={latest.deploymentFrequency.toFixed(1)} delta="+6.2%" hint="Average releases per cycle" />
        <MetricCard label="Lead time" value={`${latest.leadTimeHours.toFixed(1)}h`} delta="-12%" hint="Commit to production latency" />
        <MetricCard label="Change failure rate" value={`${(latest.changeFailureRate * 100).toFixed(0)}%`} delta="-2 pts" hint="Stable releases with lower rollback exposure" />
        <MetricCard label="MTTR" value={`${latest.mttrHours.toFixed(1)}h`} delta="-18%" hint="Faster recovery on incidents" />
      </div>
      <DoraChart
        data={rows
          .slice()
          .reverse()
          .map((row) => ({
            capturedAt: row.capturedAt,
            deploymentFrequency: row.deploymentFrequency,
            leadTimeHours: row.leadTimeHours
          }))}
      />
    </section>
  );
}
