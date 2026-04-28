"use client";

import { motion } from "framer-motion";
import { Activity, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

type FeedEvent = { type: string; payload: unknown; timestamp: string };

export function RealtimeFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([]);

  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);
    ws.onmessage = (message) => {
      const parsed = JSON.parse(message.data) as FeedEvent;
      setEvents((prev) => [parsed, ...prev].slice(0, 20));
    };
    return () => ws.close();
  }, []);

  return (
    <section className="glass-panel rounded-[28px] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Live activity</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Realtime Feed</h3>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
          <Activity className="h-3.5 w-3.5" />
          Connected
        </span>
      </div>
      <ul className="space-y-3 text-xs text-slate-300">
        {events.map((event, i) => (
          <motion.li
            key={`${event.timestamp}-${i}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white/[0.03] p-3"
          >
            <div className="mb-1 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-medium text-white">
                <Sparkles className="h-3.5 w-3.5 text-sky-300" />
                {event.type}
              </div>
              <span className="text-[11px] text-slate-500">
                {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className="line-clamp-2 text-slate-400">{JSON.stringify(event.payload)}</div>
          </motion.li>
        ))}
        {events.length === 0 ? (
          <li className="rounded-2xl bg-white/[0.03] p-4 text-sm text-slate-400">
            Waiting for pipeline activity. Trigger a PR summary or webhook event to watch updates stream in.
          </li>
        ) : null}
      </ul>
    </section>
  );
}
