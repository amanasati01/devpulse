import { ChartCard } from "@/components/chart-card";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/topbar";
import { IncidentHeatmap } from "@/components/incident-heatmap";
import { AlertTriangle } from "lucide-react";
import { clsx } from "clsx";

export default function DemoIncidentsPage() {
  const incidentStream = [
    { id: "1", title: "API latency spike in review service", severity: "high", status: "open", startedAt: new Date() },
    { id: "2", title: "Worker retry storm after webhook burst", severity: "medium", status: "monitoring", startedAt: new Date(Date.now() - 36e5) },
    { id: "3", title: "Database connection pool exhausted", severity: "high", status: "resolved", startedAt: new Date(Date.now() - 86400000) }
  ];

  const engineers = [
    { name: "Aman", load: 72, status: "overloaded" },
    { name: "Priya", load: 54, status: "watch" },
    { name: "Jordan", load: 31, status: "healthy" }
  ];

  return (
    <section className="space-y-8">
      <Topbar
        title="Incidents and on-call"
        description="See incident pressure, recurring failure patterns, and who is carrying the most operational load."
        userLabel="Guest"
      />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard
          eyebrow="Timeline"
          title="Incident stream"
          detail="Newest incidents appear first with severity and active response state."
        >
          <div className="space-y-4">
            {incidentStream.map((incident) => (
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
            ))}
          </div>
        </ChartCard>

        <div className="space-y-4">
          <ChartCard
            eyebrow="Heatmap"
            title="Incident frequency"
            detail="Rolling two-week heatmap showing hotspots (Mon-Sun)."
          >
            <IncidentHeatmap />
          </ChartCard>

          <ChartCard
            eyebrow="Workload"
            title="On-call load"
            detail="Realtime capacity view to surface responders at risk of burnout."
          >
            <div className="space-y-5">
              {engineers.map((engineer) => (
                <div key={engineer.name} className="group relative">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{engineer.name}</span>
                      {engineer.status === "overloaded" && (
                        <div className="relative group/tooltip">
                          <AlertTriangle className="h-4 w-4 text-rose-400 animate-pulse cursor-help" />
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/tooltip:block w-48 rounded-xl bg-slate-900 border border-white/10 p-2 text-[10px] text-slate-300 shadow-2xl z-50">
                            Engineer at risk of burnout. Consider redistributing load.
                          </div>
                        </div>
                      )}
                    </div>
                    <span className={clsx(
                      "text-[10px] font-bold uppercase tracking-wider",
                      engineer.status === "overloaded" ? "text-rose-400" : 
                      engineer.status === "watch" ? "text-amber-400" : "text-emerald-400"
                    )}>
                      {engineer.load}% capacity
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.05]">
                    <div 
                      className={clsx(
                        "h-full rounded-full transition-all duration-1000 ease-out",
                        engineer.status === "overloaded" ? "bg-gradient-to-r from-rose-500 to-rose-400" :
                        engineer.status === "watch" ? "bg-gradient-to-r from-amber-500 to-amber-400" :
                        "bg-gradient-to-r from-emerald-500 to-emerald-400"
                      )}
                      style={{ width: `${engineer.load}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </section>
  );
}
