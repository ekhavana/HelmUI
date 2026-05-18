interface MiniTrendProps {
  tone?: 'cyan' | 'green' | 'amber';
}

export function MiniTrend({ tone = 'cyan' }: MiniTrendProps) {
  const stroke = tone === 'green' ? '#22c55e' : tone === 'amber' ? '#f59e0b' : '#22d3ee';

  return (
    <svg className="h-12 w-full" viewBox="0 0 160 48" role="img" aria-label="trend placeholder">
      <path d="M0 36 C22 18 34 20 52 26 S86 42 106 24 S134 10 160 16" fill="none" stroke={stroke} strokeLinecap="round" strokeWidth="4" />
      <path d="M0 44 H160" stroke="rgba(148,163,184,0.22)" strokeWidth="1" />
    </svg>
  );
}
