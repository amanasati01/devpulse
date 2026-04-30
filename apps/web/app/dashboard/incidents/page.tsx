import { auth } from "@/auth";
import { prisma } from "@devpulse/db";
import { ChartCard } from "@/components/chart-card";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/topbar";

type IncidentTimelineItem = {
  id: string;
  title: string;
  severity: string;
  status: string;
  startedAt: Date;
};

type HeatmapCell = {
  day: number;
  count: number;
};

type EngineerLoad = {
  name: string;
  load: number;
};

export default async function IncidentsPage() {
  const session = await auth();
  const incidents = await prisma.incident.findMany({
    where: { orgId: session!.user.orgId },
    orderBy: { startedAt: "desc" }
  });
  const heatmap: HeatmapCell[] = Array.from({ length: 14 }, (_: unknown, index: number) => {
    if (incidents.length === 0) return { day: index, count: 0 };
    const incident = incidents[index % Math.max(incidents.length, 1)];
    return { day: index, count: incident ? (incident.severity === "high" ? 4 : 2) : (index % 5 === 0 ? 3 : 1) };
  });
  const incidentStream: IncidentTimelineItem[] = incidents;
  const engineers: EngineerLoad[] = [];

  return (
    <section className="space-y-8">
      <Topbar
        title="Incidents and on-call"
        description="See incident pressure, recurring failure patterns, and who is carrying the most operational load."
        userLabel={session?.user?.name ?? session?.user?.email}
      />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard
          eyebrow="Timeline"
          title="Incident stream"
          detail="Newest incidents appear first with severity and active response state."
        >
          <div className="space-y-4">
            {incidentStream.length > 0 ? (
              incidentStream.map((incident: IncidentTimelineItem) => (
                <article key={incident.id} className="flex gap-4 rounded-3xl bg-white/[0.03] p-4">
                  <div className="mt-1 h-3 w-3 rounded-full bg-rose-400 shadow-[0_0_0_6px_rgba(251,113,133,0.1)]" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-medium text-white">{incident.title}</h2>
                      <Badge variant={incident.severity === "high" ? "danger" : "warning"}>{incident.severity}</Badge>
                      <Badge variant={incident.status === "open" ? "info" : "neutral"}>{incident.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">
                      Started {new Date(incident.startedAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-slate-500">No active incidents.</div>
            )}
          </div>
        </ChartCard>

        <div className="space-y-4">
          <ChartCard
            eyebrow="Heatmap"
            title="Incident frequency"
            detail="Rolling two-week heatmap to show recurring hotspots."
          >
            <div className="grid grid-cols-7 gap-2">
              {heatmap.map((cell: HeatmapCell) => (
                <div
                  key={cell.day}
                  className="aspect-square rounded-2xl"
                  style={{ backgroundColor: `rgba(99,102,241,${0.08 + cell.count * 0.12})` }}
                  title={`Day ${cell.day + 1}: ${cell.count} incidents`}
                />
              ))}
            </div>
          </ChartCard>

          <ChartCard
            eyebrow="Workload"
            title="On-call load"
            detail="Simulated capacity view to surface responders at risk of overload."
          >
            <div className="space-y-3">
              {engineers.length > 0 ? (
                engineers.map((engineer: EngineerLoad) => (
                  <div key={engineer.name} className="rounded-3xl bg-white/[0.03] p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{engineer.name}</span>
                      <span className="text-xs text-slate-400">{engineer.load}% engaged</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.05]">
                      <div className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-indigo-400" style={{ width: `${engineer.load}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-sm text-slate-500">No on-call data available.</div>
              )}
            </div>
          </ChartCard>
        </div>
      </div>
    </section>
  );
}
