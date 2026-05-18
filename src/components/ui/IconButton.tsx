import type { ReactNode } from 'react';

interface IconButtonProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function IconButton({ icon, label, active = false, onClick }: IconButtonProps) {
  return (
    <button
      className={`flex min-h-14 min-w-28 flex-col items-center justify-center gap-0.5 rounded-2xl border px-5 text-sm font-semibold transition-colors ${
        active
          ? 'border-cyan-300/70 bg-cyan-400/15 text-cyan-100 shadow-glow'
          : 'border-slate-700/70 bg-slate-950/45 text-slate-300 active:bg-slate-800/80'
      }`}
      onClick={onClick}
      type="button"
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
