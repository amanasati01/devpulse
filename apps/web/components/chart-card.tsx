import { ReactNode } from "react";

export function ChartCard({
  eyebrow,
  title,
  detail,
  children
}: {
  eyebrow: string;
  title: string;
  detail: string;
  children: ReactNode;
}) {
  return (
    <section className="glass-panel rounded-[28px] p-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{eyebrow}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
        </div>
        <p className="max-w-sm text-right text-sm text-slate-400">{detail}</p>
      </div>
      {children}
    </section>
  );
}
