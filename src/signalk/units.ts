export function metersToFeet(value: number): number {
  return value * 3.28084;
}

export function metersPerSecondToKnots(value: number): number {
  return value * 1.94384;
}

export function radiansToDegrees(value: number): number {
  const degrees = value * (180 / Math.PI);
  return ((degrees % 360) + 360) % 360;
}

export function kelvinToCelsius(value: number): number {
  return value - 273.15;
}
