export function formatNumber(value: number | null | undefined, digits = 1): string {
  return value == null ? '--' : value.toFixed(digits);
}

export function formatDegrees(value: number | null | undefined): string {
  return value == null ? '---°' : `${Math.round(value).toString().padStart(3, '0')}°`;
}

export function formatKts(value: number | null | undefined): string {
  return `${formatNumber(value)} kt`;
}

export function formatFeet(value: number | null | undefined): string {
  return `${formatNumber(value)} ft`;
}

export function formatCelsius(value: number | null | undefined): string {
  return `${formatNumber(value)} °C`;
}

export function formatVoltage(value: number | null | undefined): string {
  return `${formatNumber(value)} V`;
}

export function formatAmps(value: number | null | undefined): string {
  return value == null ? '-- A' : `${value > 0 ? '+' : ''}${formatNumber(value)} A`;
}

const CARDINALS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

export function formatCardinal(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return CARDINALS[Math.round((((value % 360) + 360) % 360) / 22.5) % 16];
}
