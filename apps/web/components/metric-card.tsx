"use client";

import { motion } from "framer-motion";

export function MetricCard({
  label,
  value,
  delta,
  hint,
  highlight = false
}: {
  label: string;
  value: string;
  delta: string;
  hint: string;
  highlight?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={`relative overflow-hidden rounded-[28px] p-5 ${highlight ? "gradient-stroke bg-gradient-to-br from-indigo-500/10 via-white/[0.04] to-sky-400/10" : "glass-panel"}`}
    >
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <div className="mt-3 text-4xl font-semibold tracking-tight text-white">{value}</div>
        </div>
        <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">{delta}</span>
      </div>
      <p className="text-sm text-slate-400">{hint}</p>
    </motion.div>
  );
}
