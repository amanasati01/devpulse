import "./globals.css";
import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DevPulse - AI Engineering Intelligence",
  description: "Track PRs, compute DORA metrics, and assess risk instantly.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <div className="flex-1">
          {children}
        </div>
        <footer className="border-t border-white/5 bg-slate-950/50 py-8 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
            <p className="text-xs text-slate-500">
              © 2026 DevPulse. AI Engineering Intelligence.
            </p>
            <div className="flex items-center gap-6">
              <a 
                href="https://github.com/khanblair/devpulse" 
                target="_blank"
                className="text-xs text-slate-400 hover:text-white transition"
              >
                View on GitHub
              </a>
              <span className="text-slate-800">|</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-600">
                Production-Ready Monorepo
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
