import { Topbar } from "@/components/topbar";
import { Badge } from "@/components/ui/badge";
import { Shield, GitBranch, Bell, Brain, Zap } from "lucide-react";

export default function DemoSettingsPage() {
  const settingsGroups = [
    {
      title: "Workspace Identity",
      icon: Shield,
      fields: [
        { label: "Organization", value: "demo-workspace" },
        { label: "Plan", value: "Enterprise (Demo)" },
      ]
    },
    {
      title: "GitHub Integration",
      icon: GitBranch,
      fields: [
        { label: "Connected Repos", value: "3" },
        { label: "Webhook Status", value: "Active", status: "success" },
        { label: "Last Sync", value: "2 minutes ago" },
      ]
    },
    {
      title: "AI Configuration",
      icon: Brain,
      fields: [
        { label: "Model", value: "gpt-4o" },
        { label: "Risk Threshold", value: "70/100" },
        { label: "Analysis Mode", value: "Real-time" },
      ]
    },
    {
      title: "Notifications",
      icon: Bell,
      fields: [
        { label: "Slack Channel", value: "#eng-alerts" },
        { label: "Frequency", value: "Instant" },
      ]
    }
  ];

  return (
    <section className="space-y-8">
      <Topbar
        title="Settings"
        description="Configure your engineering intelligence environment. These settings are read-only in demo mode."
        userLabel="Guest"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {settingsGroups.map((group) => (
          <div key={group.title} className="glass-panel overflow-hidden rounded-[28px]">
            <div className="flex items-center gap-3 border-b border-white/5 bg-white/[0.02] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                <group.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white">{group.title}</h3>
            </div>
            <div className="space-y-4 p-6">
              {group.fields.map((field) => (
                <div key={field.label} className="flex items-center justify-between border-b border-white/[0.03] pb-4 last:border-0 last:pb-0">
                  <span className="text-sm text-slate-400">{field.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-200">{field.value}</span>
                    {field.status === "success" && (
                      <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[32px] gradient-stroke bg-indigo-500/5 p-8 text-center">
        <Zap className="mx-auto h-10 w-10 text-indigo-400" />
        <h3 className="mt-4 text-xl font-bold text-white">Ready to connect your own data?</h3>
        <p className="mt-2 text-slate-400">
          Sign in with GitHub to start tracking live DORA metrics and AI risk scores for your own repositories.
        </p>
        <div className="mt-8 flex justify-center">
          <Badge variant="info" className="px-4 py-2 text-sm">Demo Mode Restricted</Badge>
        </div>
      </div>
    </section>
  );
}
