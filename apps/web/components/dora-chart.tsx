"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "@/components/chart-card";

type Props = {
  data: Array<{ capturedAt: string; deploymentFrequency: number; leadTimeHours: number }>;
};

export function DoraChart({ data }: Props) {
  return (
    <ChartCard
      eyebrow="Velocity"
      title="DORA momentum"
      detail="Track release throughput and lead time shifts over recent engineering cycles."
    >
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="deployments" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="leadTime" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.12)" />
            <XAxis
              dataKey="capturedAt"
              tickFormatter={(value) => new Date(value).toLocaleDateString([], { month: "short", day: "numeric" })}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "rgba(15, 23, 42, 0.92)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "18px"
              }}
            />
            <Area type="monotone" dataKey="deploymentFrequency" stroke="#7dd3fc" fill="url(#deployments)" strokeWidth={2} />
            <Area type="monotone" dataKey="leadTimeHours" stroke="#818cf8" fill="url(#leadTime)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
