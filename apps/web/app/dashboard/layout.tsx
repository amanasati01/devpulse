import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { ReactNode } from "react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-6 md:px-6 lg:px-8">
      <AppSidebar />
      <main className="min-h-[calc(100vh-3rem)] flex-1 rounded-[32px]">
        <div className="rounded-[32px] border border-white/8 bg-slate-950/50 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-sm md:p-8">
          <div className="mb-6 flex items-center justify-end">
            <div className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 text-sm font-semibold text-white">
                {(session?.user?.name?.[0] ?? session?.user?.email?.[0] ?? "D").toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{session?.user?.name ?? "DevPulse User"}</p>
                <p className="text-xs text-slate-400">{session?.user?.email ?? "active workspace"}</p>
              </div>
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
