export function formatNumber(value: number, digits = 1): string {
  return value.toFixed(digits);
}

export function formatDegrees(value: number): string {
  return `${Math.round(value).toString().padStart(3, '0')}°`;
}

export function formatKts(value: number): string {
  return `${formatNumber(value)} kt`;
}

export function formatFeet(value: number): string {
  return `${formatNumber(value)} ft`;
}

export function formatCelsius(value: number): string {
  return `${formatNumber(value)} °C`;
}

export function formatVoltage(value: number): string {
  return `${formatNumber(value)} V`;
}

export function formatAmps(value: number): string {
  return `${value > 0 ? '+' : ''}${formatNumber(value)} A`;
}
