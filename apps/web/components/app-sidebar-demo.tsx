"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { BarChart3, BellDot, GitPullRequestArrow, Home, Settings2, ShieldAlert } from "lucide-react";
import { clsx } from "clsx";

const items: Array<{ href: Route; label: string; icon: typeof Home }> = [
  { href: "/demo" as Route, label: "Overview", icon: Home },
  { href: "/demo/dora" as Route, label: "DORA", icon: BarChart3 },
  { href: "/demo/prs" as Route, label: "PR Intelligence", icon: GitPullRequestArrow },
  { href: "/demo/incidents" as Route, label: "Incidents", icon: ShieldAlert },
  { href: "/demo/settings" as Route, label: "Settings", icon: Settings2 }
];

export function AppSidebarDemo() {
  const pathname = usePathname();

  return (
    <aside className="glass-panel sticky top-6 hidden h-[calc(100vh-3rem)] w-72 shrink-0 rounded-[28px] p-5 lg:flex lg:flex-col">
      <div className="gradient-stroke rounded-2xl bg-gradient-to-br from-indigo-500/20 via-transparent to-sky-400/10 p-4">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 font-semibold text-white shadow-lg shadow-indigo-500/20">
            DP
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-white">DevPulse</p>
            <p className="text-xs text-slate-400">AI Engineering Intelligence</p>
          </div>
        </div>
        <div className="rounded-2xl bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Deployment</p>
          <p className="mt-2 text-lg font-semibold text-white">Elite execution mode</p>
          <p className="mt-2 text-sm text-slate-400">High-signal engineering metrics, live review risk, and delivery health in one place.</p>
        </div>
      </div>

      <nav className="mt-6 space-y-1.5">
          {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                active
                  ? "bg-white/[0.08] text-white shadow-[0_8px_24px_rgba(15,23,42,0.25)]"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              )}
            >
              <Icon className={clsx("h-4 w-4", active ? "text-sky-300" : "text-slate-500 group-hover:text-slate-200")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
            <BellDot className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Realtime sync online</p>
            <p className="text-xs text-slate-400">Streaming pipeline and AI updates</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
