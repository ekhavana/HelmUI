import type { ReactNode } from 'react';

type CardTone = 'default' | 'safe' | 'warning' | 'danger' | 'active';

interface CardProps {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
  tone?: CardTone;
}

const toneClasses: Record<CardTone, string> = {
  default: 'border-slate-700/70 bg-slate-950/45',
  safe: 'border-emerald-400/45 bg-emerald-950/20',
  warning: 'border-amber-400/55 bg-amber-950/20',
  danger: 'border-red-400/60 bg-red-950/25 shadow-danger',
  active: 'border-cyan-300/55 bg-cyan-950/20 shadow-glow',
};

export function Card({ title, eyebrow, children, className = '', tone = 'default' }: CardProps) {
  return (
    <section className={`rounded-3xl border ${toneClasses[tone]} p-5 backdrop-blur-md ${className}`}>
      {(title || eyebrow) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            {eyebrow && <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{eyebrow}</div>}
            {title && <h2 className="mt-1 text-xl font-semibold text-slate-100">{title}</h2>}
          </div>
        </header>
      )}
      {children}
    </section>
  );
}
