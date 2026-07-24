import { auth, signOut } from "@/auth";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <section className="space-y-8">
      <Topbar
        title="Settings"
        description="Control workspace identity, team setup, and integrations with a clean ops-focused settings surface."
        userLabel={session?.user?.name ?? session?.user?.email}
      />

      <div className="grid gap-4 xl:grid-cols-[220px_1fr]">
        <div className="glass-panel rounded-[28px] p-3">
          <div className="rounded-2xl bg-white/[0.06] px-4 py-3 text-sm font-medium text-white">General</div>
          <div className="px-4 py-3 text-sm text-slate-400">Team</div>
          <div className="px-4 py-3 text-sm text-slate-400">Integrations</div>
        </div>

        <div className="space-y-4">
          <div className="glass-panel rounded-[28px] p-6">
            <h2 className="text-lg font-semibold text-white">Workspace identity</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-slate-400">Organization name</span>
                <input
                  defaultValue="DevPulse Labs"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/50"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-slate-400">Primary email</span>
                <input
                  defaultValue={session?.user?.email ?? ""}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/50"
                />
              </label>
            </div>
            <div className="mt-5 flex gap-3">
              <Button type="button">Save changes</Button>
              <Button type="button" variant="secondary">
                Test connection
              </Button>
            </div>
          </div>

          <div className="glass-panel rounded-[28px] p-6">
            <h2 className="text-lg font-semibold text-white">Connected integrations</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {[
                { name: "GitHub", detail: "OAuth and webhook ingestion", status: "Healthy" },
                { name: "OpenAI", detail: "PR summary and risk scoring", status: "Online" }
              ].map((item) => (
                <div key={item.name} className="rounded-3xl bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-white">{item.name}</p>
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">{item.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/api/auth/signin" });
            }}
            className="glass-panel rounded-[28px] p-6"
          >
            <h2 className="text-lg font-semibold text-white">Session control</h2>
            <p className="mt-2 text-sm text-slate-400">End the current authenticated session for this workspace.</p>
            <div className="mt-5">
              <Button type="submit" variant="secondary">
                Sign out
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
