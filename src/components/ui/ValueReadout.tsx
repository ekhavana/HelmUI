interface ValueReadoutProps {
  label: string;
  value: string;
  unit?: string;
  size?: 'md' | 'lg' | 'xl';
  accent?: string;
}

const sizeClasses = {
  md: 'text-xl lg:text-4xl',
  lg: 'text-2xl lg:text-5xl',
  xl: 'text-4xl lg:text-7xl',
};

export function ValueReadout({ label, value, unit, size = 'lg', accent = 'text-white' }: ValueReadoutProps) {
  return (
    <div>
      <div className="text-[8px] font-semibold uppercase tracking-[0.2em] text-slate-400 lg:text-sm">{label}</div>
      <div className={`flex items-baseline gap-1 font-bold leading-none tabular-nums lg:mt-1 lg:gap-2 ${accent}`}>
        <span className={sizeClasses[size]}>{value}</span>
        {unit && <span className="text-[10px] text-slate-300 lg:text-xl">{unit}</span>}
      </div>
    </div>
  );
}
