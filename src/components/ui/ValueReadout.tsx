interface ValueReadoutProps {
  label: string;
  value: string;
  unit?: string;
  size?: 'md' | 'lg' | 'xl';
  accent?: string;
}

const sizeClasses = {
  md: 'text-4xl',
  lg: 'text-5xl',
  xl: 'text-7xl',
};

export function ValueReadout({ label, value, unit, size = 'lg', accent = 'text-white' }: ValueReadoutProps) {
  return (
    <div>
      <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</div>
      <div className={`mt-1 flex items-baseline gap-2 font-bold tabular-nums ${accent}`}>
        <span className={sizeClasses[size]}>{value}</span>
        {unit && <span className="text-xl text-slate-300">{unit}</span>}
      </div>
    </div>
  );
}
