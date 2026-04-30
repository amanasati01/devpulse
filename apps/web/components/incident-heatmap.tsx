"use client";

import { clsx } from "clsx";

const data = [
  { day: "Mon", week1: 1, week2: 0 },
  { day: "Tue", week1: 0, week2: 1 },
  { day: "Wed", week1: 3, week2: 1 },
  { day: "Thu", week1: 1, week2: 0 },
  { day: "Fri", week1: 2, week2: 3 },
  { day: "Sat", week1: 0, week2: 1 },
  { day: "Sun", week1: 0, week2: 0 },
];

function getColor(count: number) {
  if (count === 0) return "bg-white/[0.03] ring-white/5";
  if (count === 1) return "bg-amber-400/40 ring-amber-400/50";
  if (count === 2) return "bg-orange-500/60 ring-orange-500/70";
  return "bg-rose-500 ring-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]";
}

export function IncidentHeatmap() {
  return (
    <div className="p-4">
      <div className="grid grid-cols-[auto_1fr_1fr] gap-4">
        <div />
        <div className="text-center text-[10px] uppercase tracking-widest text-slate-500">Week 1</div>
        <div className="text-center text-[10px] uppercase tracking-widest text-slate-500">Week 2</div>

        {data.map((item) => (
          <div key={item.day} className="contents">
            <div className="flex items-center justify-end pr-2 text-xs font-medium text-slate-400">
              {item.day}
            </div>
            <div
              className={clsx(
                "h-10 rounded-xl transition duration-300 ring-1",
                getColor(item.week1)
              )}
              title={`${item.day} Week 1: ${item.week1} incidents`}
            />
            <div
              className={clsx(
                "h-10 rounded-xl transition duration-300 ring-1",
                getColor(item.week2)
              )}
              title={`${item.day} Week 2: ${item.week2} incidents`}
            />
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex items-center justify-center gap-6 border-t border-white/5 pt-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-white/[0.03] ring-1 ring-white/5" />
          <span className="text-[10px] text-slate-500 uppercase">0</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-amber-400/40 ring-1 ring-amber-400/50" />
          <span className="text-[10px] text-slate-500 uppercase">1</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-orange-500/60 ring-1 ring-orange-500/70" />
          <span className="text-[10px] text-slate-500 uppercase">2</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-rose-500 ring-1 ring-rose-500" />
          <span className="text-[10px] text-slate-500 uppercase">3+</span>
        </div>
      </div>
    </div>
  );
}
