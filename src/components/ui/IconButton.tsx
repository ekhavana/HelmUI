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
      className={`flex min-h-10 min-w-14 flex-col items-center justify-center gap-0.5 rounded-xl border px-2 text-[10px] font-semibold transition-colors lg:min-h-16 lg:min-w-28 lg:gap-1 lg:rounded-2xl lg:px-5 lg:text-sm ${
        active
          ? 'border-cyan-300/70 bg-cyan-400/15 text-cyan-100 shadow-glow'
          : 'border-slate-700/70 bg-slate-950/45 text-slate-300 active:bg-slate-800/80'
      }`}
      onClick={onClick}
      type="button"
    >
      <span className="text-base lg:text-xl">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
