import type { ReactNode } from 'react';
import { Card } from '../ui/Card';

interface ModePlaceholderProps {
  title: string;
  eyebrow: string;
  icon: ReactNode;
  summary: string;
  items: string[];
}

export function ModePlaceholder({ title, eyebrow, icon, summary, items }: ModePlaceholderProps) {
  return (
    <section className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_420px] gap-4">
      <Card className="relative overflow-hidden rounded-[2rem]" tone="active">
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full bg-[linear-gradient(rgba(34,211,238,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.14)_1px,transparent_1px)] bg-[size:72px_72px]" />
        </div>
        <div className="relative flex h-full min-h-[520px] flex-col justify-between">
          <div>
            <div className="text-sm font-bold uppercase tracking-[0.28em] text-cyan-200">{eyebrow}</div>
            <div className="mt-6 flex items-center gap-5 text-white">
              <div className="rounded-3xl border border-cyan-300/35 bg-cyan-400/10 p-5 text-cyan-100">{icon}</div>
              <h1 className="text-7xl font-bold tracking-tight">{title}</h1>
            </div>
            <p className="mt-8 max-w-4xl text-3xl font-medium leading-tight text-slate-200">{summary}</p>
          </div>
          <div className="rounded-3xl border border-slate-700/70 bg-slate-950/55 p-6 text-xl font-semibold text-slate-300">
            Touch-first mode shell is ready. Detailed controls and integrations can be layered in without changing the persistent safety strip or navigation.
          </div>
        </div>
      </Card>
      <aside className="flex min-h-0 flex-col gap-4">
        {items.map((item) => (
          <Card key={item} className="min-h-28" tone="default">
            <div className="text-lg font-semibold text-slate-200">{item}</div>
            <div className="mt-2 h-2 rounded-full bg-slate-800">
              <div className="h-full w-2/3 rounded-full bg-cyan-300/70" />
            </div>
          </Card>
        ))}
      </aside>
    </section>
  );
}
