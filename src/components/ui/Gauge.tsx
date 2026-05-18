interface GaugeProps {
  value: number;
  max?: number;
  tone?: 'cyan' | 'green' | 'amber' | 'red';
}

export function Gauge({ value, max = 100, tone = 'cyan' }: GaugeProps) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  const color = tone === 'green' ? 'bg-safety-safe' : tone === 'amber' ? 'bg-safety-warning' : tone === 'red' ? 'bg-safety-danger' : 'bg-safety-active';

  return (
    <div className="h-3 overflow-hidden rounded-full bg-slate-800">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
    </div>
  );
}
