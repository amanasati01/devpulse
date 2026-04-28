"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ChevronDown, ChevronUp, Clock3, GitPullRequestArrow, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type PR = {
  id: string;
  repo: string;
  number: number;
  title: string;
  author?: string;
  state: string;
  additions?: number;
  deletions?: number;
  changedFiles?: number;
  createdAt?: string | Date;
  summary: string | null;
  riskScore?: {
    score: number;
    rationale: string;
  } | null;
};

export function PRTable({ prs }: { prs: PR[] }) {
  const [rows, setRows] = useState(prs);
  const [loading, setLoading] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(rows[0]?.id ?? null);

  async function runSummary(prId: string) {
    setLoading((prev) => ({ ...prev, [prId]: "summary" }));
    try {
      const response = await fetch(`/api/prs/${prId}/summary`, { method: "POST" });
      const updated = (await response.json()) as PR;
      setRows((prev) => prev.map((row) => (row.id === prId ? { ...row, summary: updated.summary } : row)));
    } finally {
      setLoading((prev) => ({ ...prev, [prId]: "" }));
    }
  }

  async function runRiskScore(prId: string) {
    setLoading((prev) => ({ ...prev, [prId]: "risk" }));
    try {
      const response = await fetch("/api/risk-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pullRequestId: prId })
      });
      const risk = (await response.json()) as { score: number; rationale: string };
      setRows((prev) =>
        prev.map((row) => (row.id === prId ? { ...row, riskScore: { score: risk.score, rationale: risk.rationale } } : row))
      );
    } finally {
      setLoading((prev) => ({ ...prev, [prId]: "" }));
    }
  }

  return (
    <div className="glass-panel rounded-[28px] p-4 md:p-6">
      <div className="mb-5 grid gap-3 rounded-[28px] bg-white/[0.03] px-5 py-4 text-xs uppercase tracking-[0.22em] text-slate-500 md:grid-cols-[1.4fr_0.5fr_0.8fr_0.7fr_0.9fr]">
        <span>Pull request</span>
        <span>Status</span>
        <span>Review signal</span>
        <span>Freshness</span>
        <span>Actions</span>
      </div>

      <div className="space-y-3">
        {rows.map((pr) => {
          const isExpanded = expanded === pr.id;
          const score = pr.riskScore?.score ?? 58;
          const stale = pr.createdAt ? Date.now() - new Date(pr.createdAt).getTime() > 1000 * 60 * 60 * 24 * 3 : false;

          return (
            <motion.div
              key={pr.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-[28px] p-5 ${stale ? "gradient-stroke bg-amber-500/5" : "bg-white/[0.03]"}`}
            >
              <div className="grid gap-4 md:grid-cols-[1.4fr_0.5fr_0.8fr_0.7fr_0.9fr] md:items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-sky-400/20 text-sky-200">
                    <GitPullRequestArrow className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-white">{pr.title}</p>
                      <span className="text-xs text-slate-500">#{pr.number}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                      {pr.repo} {pr.author ? `· ${pr.author}` : ""}
                    </p>
                  </div>
                </div>

                <div>
                  <Badge variant={pr.state === "open" ? "info" : pr.state === "closed" ? "danger" : "success"}>{pr.state}</Badge>
                </div>

                <div>
                  <div className="text-sm font-medium text-white">{score}/100 risk</div>
                  <div className="mt-1 h-2 rounded-full bg-white/[0.05]">
                    <div className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-indigo-400" style={{ width: `${score}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-400">
                  {stale ? <AlertTriangle className="h-4 w-4 text-amber-300" /> : <Clock3 className="h-4 w-4 text-slate-500" />}
                  {stale ? "Stale" : "Active"}
                </div>

                <div className="flex items-center gap-2">
                  <Button type="button" variant="secondary" className="px-3 py-2 text-xs" disabled={!!loading[pr.id]} onClick={() => runSummary(pr.id)}>
                    {loading[pr.id] === "summary" ? "Running..." : "Summary"}
                  </Button>
                  <Button type="button" className="px-3 py-2 text-xs" disabled={!!loading[pr.id]} onClick={() => runRiskScore(pr.id)}>
                    {loading[pr.id] === "risk" ? "Running..." : "Risk"}
                  </Button>
                  <button
                    type="button"
                    className="rounded-2xl p-2 text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
                    onClick={() => setExpanded((prev) => (prev === pr.id ? null : pr.id))}
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {isExpanded ? (
                <div className="mt-4 grid gap-4 border-t border-white/10 pt-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-3xl bg-slate-950/50 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
                      <Sparkles className="h-4 w-4 text-sky-300" />
                      AI summary
                    </div>
                    <p className="text-sm leading-7 text-slate-300">
                      {pr.summary ??
                        "No summary generated yet. Trigger AI summary to create rollout notes, key changes, and review guidance for this PR."}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/50 p-4">
                    <div className="mb-3 text-sm font-medium text-white">Change footprint</div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-2xl bg-white/[0.03] p-3">
                        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Additions</div>
                        <div className="mt-2 text-2xl font-semibold text-white">{pr.additions ?? 0}</div>
                      </div>
                      <div className="rounded-2xl bg-white/[0.03] p-3">
                        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Deletions</div>
                        <div className="mt-2 text-2xl font-semibold text-white">{pr.deletions ?? 0}</div>
                      </div>
                      <div className="rounded-2xl bg-white/[0.03] p-3">
                        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Files</div>
                        <div className="mt-2 text-2xl font-semibold text-white">{pr.changedFiles ?? 0}</div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {pr.riskScore?.rationale ?? "Generate a risk score to get AI rationale and rollout recommendations."}
                    </p>
                  </div>
                </div>
              ) : null}
            </motion.div>
          );
        })}

        {rows.length === 0 ? (
          <div className="rounded-[28px] bg-white/[0.03] p-10 text-center">
            <p className="text-lg font-medium text-white">No pull requests yet</p>
            <p className="mt-2 text-sm text-slate-400">Send a GitHub webhook or connect your org to populate live PR intelligence.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
