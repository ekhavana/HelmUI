export type SafetyState = 'safe' | 'warning' | 'danger';

export const depthThresholdsFt = {
  warningBelow: 10,
  dangerBelow: 6,
};

export const batteryThresholds = {
  dangerPercent: 20,
  dangerVoltage: 12.0,
  warningPercent: 45,
  warningVoltage: 12.4,
};

export const engineThresholds = {
  coolantWarningC: 82,
  coolantDangerC: 90,
  oilWarningPsi: 40,
  oilDangerPsi: 30,
};

export function getDepthSafetyState(depthFt: number, warningBelowFt: number = depthThresholdsFt.warningBelow): SafetyState {
  const dangerBelowFt = Math.max(2, warningBelowFt - 3);
  if (depthFt < dangerBelowFt) return 'danger';
  if (depthFt <= warningBelowFt) return 'warning';
  return 'safe';
}

export function getAisSafetyState(closestNm: number, targets: number): SafetyState {
  if (targets === 0) return 'safe';
  if (closestNm < 0.75) return 'danger';
  if (closestNm < 2) return 'warning';
  return 'safe';
}

export function getBatterySafetyState(percent: number, voltage: number): SafetyState {
  if (percent < batteryThresholds.dangerPercent || voltage < batteryThresholds.dangerVoltage) return 'danger';
  if (percent < batteryThresholds.warningPercent || voltage < batteryThresholds.warningVoltage) return 'warning';
  return 'safe';
}

export function safetyColor(state: SafetyState): string {
  if (state === 'danger') return 'text-safety-danger border-safety-danger/60 bg-red-950/30';
  if (state === 'warning') return 'text-safety-warning border-safety-warning/60 bg-amber-950/30';
  return 'text-safety-safe border-safety-safe/50 bg-emerald-950/20';
}
