import { AppSidebarDemo } from "@/components/app-sidebar-demo";
import { ReactNode } from "react";

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-6 md:px-6 lg:px-8">
      <AppSidebarDemo />
      <main className="min-h-[calc(100vh-3rem)] flex-1 rounded-[32px]">
        <div className="rounded-[32px] border border-white/8 bg-slate-950/50 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-sm md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300">
              <span className="flex h-2 w-2 rounded-full bg-indigo-400 mr-2 animate-pulse"></span>
              Public Demo Mode
            </div>
            <div className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 text-sm font-semibold text-white">
                G
              </div>
              <div>
                <p className="text-sm font-medium text-white">Guest User</p>
                <p className="text-xs text-slate-400">demo workspace</p>
              </div>
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
