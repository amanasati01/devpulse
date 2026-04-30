"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { cycle: "Cycle 1", leadTime: 16.5, deploys: 10 },
  { cycle: "Cycle 2", leadTime: 14.2, deploys: 12 },
  { cycle: "Cycle 3", leadTime: 18.0, deploys: 9 },
  { cycle: "Cycle 4", leadTime: 12.1, deploys: 15 },
  { cycle: "Cycle 5", leadTime: 10.8, deploys: 17 },
  { cycle: "Cycle 6", leadTime: 9.4, deploys: 19 },
  { cycle: "Cycle 7", leadTime: 8.2, deploys: 21 },
  { cycle: "Cycle 8", leadTime: 6.2, deploys: 24 }
];

export function DoraMomentumChart() {
  return (
    <div className="h-[400px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
          <XAxis 
            dataKey="cycle" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }}
            itemStyle={{ fontSize: "12px" }}
          />
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            wrapperStyle={{ paddingBottom: "20px", fontSize: "12px" }}
          />
          <Line 
            type="monotone" 
            dataKey="leadTime" 
            name="Lead Time (hrs)" 
            stroke="#818cf8" 
            strokeWidth={3}
            dot={{ r: 4, fill: "#818cf8", strokeWidth: 2, stroke: "#0f172a" }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line 
            type="monotone" 
            dataKey="deploys" 
            name="Deploy Frequency" 
            stroke="#38bdf8" 
            strokeWidth={3}
            dot={{ r: 4, fill: "#38bdf8", strokeWidth: 2, stroke: "#0f172a" }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
