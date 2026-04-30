"use client";

import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function DemoBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("devpulse-demo-dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem("devpulse-demo-dismissed", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 z-[100] w-[90%] max-w-2xl -translate-x-1/2"
        >
          <div className="glass-panel flex items-center justify-between gap-6 overflow-hidden rounded-2xl bg-slate-900/90 p-4 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">This is a live demo with simulated data.</p>
                <p className="text-xs text-slate-400">
                  <a href="/api/auth/signin" className="text-indigo-400 hover:underline">Sign in with GitHub</a> to connect your real repositories.
                </p>
              </div>
            </div>
            <button
              onClick={dismiss}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
