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
    <section className={`min-h-0 overflow-hidden rounded-2xl border ${toneClasses[tone]} p-2 backdrop-blur-md lg:rounded-3xl lg:p-5 ${className}`}>
      {(title || eyebrow) && (
        <header className="mb-0.5 flex items-start justify-between gap-2 lg:mb-3 lg:gap-3">
          <div>
            {eyebrow && <div className="hidden text-[8px] font-semibold uppercase tracking-[0.22em] text-slate-400 lg:block lg:text-xs">{eyebrow}</div>}
            {title && <h2 className="text-[11px] font-semibold leading-tight text-slate-100 lg:mt-1 lg:text-xl">{title}</h2>}
          </div>
        </header>
      )}
      {children}
    </section>
  );
}
