import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50 selection:bg-indigo-500/30">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 font-bold text-white shadow-lg shadow-indigo-500/20">
            DP
          </div>
          <span className="text-xl font-bold tracking-tight text-white">DevPulse</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/demo" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            View Demo
          </Link>
          <Button asChild variant="primary" className="bg-white text-slate-950 hover:bg-slate-200">
            <a href="/api/auth/signin">Sign in with GitHub</a>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950"></div>
          <div className="relative mx-auto max-w-5xl px-6 text-center">
            <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-indigo-400 mr-2 animate-pulse"></span>
              Live PR Intelligence
            </div>
            <h1 className="bg-gradient-to-br from-white to-slate-400 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-7xl">
              Engineering visibility, <br />
              <span className="text-indigo-400">without the noise.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
              DevPulse tracks your GitHub pull requests, calculates DORA metrics in real-time, and uses AI to flag risky code changes before they hit production. Designed for engineering managers who demand high-signal insights.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button asChild className="h-12 px-8 text-base bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/20">
                <a href="/api/auth/signin">Get Started for Free</a>
              </Button>
              <Button asChild variant="ghost" className="h-12 px-8 text-base border border-white/10 hover:bg-white/5">
                <Link href="/demo">Explore the Demo</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Dashboard Preview */}
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-2 shadow-2xl backdrop-blur-sm">
            <div className="rounded-2xl border border-white/5 bg-slate-950 p-8">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl bg-white/[0.02] p-6 border border-white/5">
                  <div className="h-10 w-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">AI Risk Radar</h3>
                  <p className="mt-2 text-sm text-slate-400">Every PR is automatically scored by OpenAI to flag massive refactors or high-risk architectural changes.</p>
                </div>
                <div className="rounded-2xl bg-white/[0.02] p-6 border border-white/5">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Live DORA Metrics</h3>
                  <p className="mt-2 text-sm text-slate-400">Continuous tracking of deployment frequency, lead time for changes, and MTTR without manual spreadsheets.</p>
                </div>
                <div className="rounded-2xl bg-white/[0.02] p-6 border border-white/5">
                  <div className="h-10 w-10 rounded-lg bg-rose-500/20 flex items-center justify-center mb-4 text-rose-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Incident Stream</h3>
                  <p className="mt-2 text-sm text-slate-400">Correlate outages with code deploys. Map on-call load to ensure your team isn't burning out.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-white/10 bg-slate-900/20 py-24">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl text-center mb-16">Zero-config integration</h2>
            <div className="grid gap-12 md:grid-cols-3">
              <div className="relative">
                <div className="text-5xl font-extrabold text-white/5 absolute -top-8 -left-4">01</div>
                <h3 className="text-xl font-bold text-white relative">Connect GitHub</h3>
                <p className="mt-4 text-slate-400">Sign in with your GitHub account. DevPulse automatically maps to your organization.</p>
              </div>
              <div className="relative">
                <div className="text-5xl font-extrabold text-white/5 absolute -top-8 -left-4">02</div>
                <h3 className="text-xl font-bold text-white relative">Add Webhook</h3>
                <p className="mt-4 text-slate-400">Drop the DevPulse webhook URL into your repository settings. We instantly ingest all PR events.</p>
              </div>
              <div className="relative">
                <div className="text-5xl font-extrabold text-white/5 absolute -top-8 -left-4">03</div>
                <h3 className="text-xl font-bold text-white relative">Get Insights</h3>
                <p className="mt-4 text-slate-400">Our background workers use BullMQ and OpenAI to analyze the diffs and stream insights to your dashboard.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-10 text-center">
        <p className="text-sm text-slate-500">
          Built for engineering leaders. Open source on GitHub.
        </p>
      </footer>
    </div>
  );
}
