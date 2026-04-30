"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Activity, Sparkles, GitPullRequestArrow, ShieldAlert, Rocket, Settings, User } from "lucide-react";
import { useEffect, useState, useRef } from "react";

type FeedEvent = { type: string; message: string; timestamp: number; iconType: "pr" | "incident" | "deploy" | "system" | "user" };

const DEMO_EVENT_POOL: Omit<FeedEvent, "timestamp">[] = [
  { type: "AI Analysis", message: "PR #143 analyzed — AI risk score: 71/100 · auth-service", iconType: "pr" },
  { type: "Webhook", message: "Webhook received from frontend-monorepo · PR #144 opened", iconType: "system" },
  { type: "Deployment", message: "Deploy detected on main · lead time recorded: 5.8h", iconType: "deploy" },
  { type: "Incident", message: "Incident #204 auto-correlated with PR #141 merge", iconType: "incident" },
  { type: "BullMQ", message: "BullMQ job completed · PR diff analysis finished in 2.3s", iconType: "system" },
  { type: "AI Radar", message: "PR #142 flagged for senior review · risk threshold exceeded", iconType: "pr" },
  { type: "DORA Update", message: "MTTR updated · incident resolved in 0.9h", iconType: "incident" },
  { type: "New Contributor", message: "New contributor detected · first PR opened by @maya-dev", iconType: "user" }
];

export function RealtimeFeed({ isDemo }: { isDemo?: boolean }) {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isDemo) {
      const addEvent = () => {
        const randomEvent = DEMO_EVENT_POOL[Math.floor(Math.random() * DEMO_EVENT_POOL.length)];
        setEvents((prev) => [{ ...randomEvent, timestamp: Date.now() }, ...prev].slice(0, 8));
        
        const nextTime = 10000 + Math.random() * 5000;
        intervalRef.current = setTimeout(addEvent, nextTime);
      };

      addEvent();
      return () => clearTimeout(intervalRef.current);
    }

    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);
    ws.onmessage = (message) => {
      const parsed = JSON.parse(message.data);
      // Map real WS events to our local type if needed, or just handle both
      setEvents((prev) => [{ 
        type: parsed.type, 
        message: JSON.stringify(parsed.payload), 
        timestamp: Date.now(),
        iconType: "system" 
      } as FeedEvent, ...prev].slice(0, 8));
    };
    return () => ws.close();
  }, [isDemo]);

  const getIcon = (type: string) => {
    switch (type) {
      case "pr": return <GitPullRequestArrow className="h-3.5 w-3.5 text-sky-300" />;
      case "incident": return <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />;
      case "deploy": return <Rocket className="h-3.5 w-3.5 text-emerald-400" />;
      case "user": return <User className="h-3.5 w-3.5 text-indigo-400" />;
      default: return <Settings className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return "just now";
    return `${Math.floor(diff / 60000)}m ago`;
  };

  return (
    <section className="glass-panel rounded-[28px] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Live activity</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Realtime Feed</h3>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
          <Activity className="h-3.5 w-3.5" />
          {isDemo ? "Live Simulation" : "Connected"}
        </span>
      </div>
      <ul className="space-y-3 min-h-[300px]">
        <AnimatePresence initial={false}>
          {events.map((event) => (
            <motion.li
              key={event.timestamp}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl bg-white/[0.03] p-3 border border-white/5"
            >
              <div className="mb-1 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-medium text-white text-[11px]">
                  {getIcon(event.iconType)}
                  <span className="uppercase tracking-wider opacity-60 text-[9px]">{event.type}</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {formatTime(event.timestamp)}
                </span>
              </div>
              <div className="text-[12px] leading-relaxed text-slate-300">
                {event.message}
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
        {events.length === 0 ? (
          <li className="rounded-2xl bg-white/[0.03] p-6 text-center text-sm text-slate-500 border border-dashed border-white/10">
            Waiting for pipeline activity...
          </li>
        ) : null}
      </ul>
    </section>
  );
}
