import { Github, Search, Sparkles } from "lucide-react";
import Link from "next/link";

export function Topbar({
  title,
  description,
  userLabel
}: {
  title: string;
  description: string;
  userLabel?: string | null;
}) {
  return (
    <div className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-sky-300/80">Engineering control center</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link 
          href="https://github.com/khanblair/devpulse" 
          target="_blank"
          className="glass-panel flex h-12 items-center gap-3 rounded-2xl px-5 py-3 transition hover:bg-white/[0.08]"
        >
          <Github className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-200">Source</span>
        </Link>
        <div className="glass-panel flex h-12 min-w-[260px] items-center gap-3 rounded-2xl px-4 py-3">
          <Search className="h-4 w-4 text-slate-500" />
          <span className="text-sm text-slate-500">Search PRs...</span>
        </div>
        <div className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{userLabel ?? "DevPulse Operator"}</p>
            <p className="text-xs text-slate-400">Active org workspace</p>
          </div>
        </div>
      </div>
    </div>
  );
}
