export type SafetyState = 'safe' | 'warning' | 'danger';

export const depthThresholdsFt = {
  warningBelow: 10,
  dangerBelow: 6,
};

export function getDepthSafetyState(depthFt: number): SafetyState {
  if (depthFt < depthThresholdsFt.dangerBelow) return 'danger';
  if (depthFt <= depthThresholdsFt.warningBelow) return 'warning';
  return 'safe';
}

export function getAisSafetyState(closestNm: number, targets: number): SafetyState {
  if (targets === 0) return 'safe';
  if (closestNm < 0.75) return 'danger';
  if (closestNm < 2) return 'warning';
  return 'safe';
}

export function getBatterySafetyState(percent: number, voltage: number): SafetyState {
  if (percent < 20 || voltage < 12) return 'danger';
  if (percent < 45 || voltage < 12.4) return 'warning';
  return 'safe';
}

export function safetyColor(state: SafetyState): string {
  if (state === 'danger') return 'text-safety-danger border-safety-danger/60 bg-red-950/30';
  if (state === 'warning') return 'text-safety-warning border-safety-warning/60 bg-amber-950/30';
  return 'text-safety-safe border-safety-safe/50 bg-emerald-950/20';
}
