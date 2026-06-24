function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function getSunsetUTC(date: Date, lat: number, lon: number): Date | null {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const n = Math.floor(jd - 2451545.0 + 0.0008);
  const jStar = n - lon / 360;
  const M = (357.5291 + 0.98560028 * jStar) % 360;
  const C = 1.9148 * Math.sin(toRad(M)) + 0.02 * Math.sin(toRad(2 * M)) + 0.0003 * Math.sin(toRad(3 * M));
  const lambda = (M + C + 180 + 102.9372) % 360;
  const jTransit = 2451545.0 + jStar + 0.0053 * Math.sin(toRad(M)) - 0.0069 * Math.sin(toRad(2 * lambda));
  const sinD = Math.sin(toRad(lambda)) * Math.sin(toRad(23.4397));
  const cosD = Math.cos(Math.asin(sinD));
  const cosOmega = (Math.sin(toRad(-0.833)) - Math.sin(toRad(lat)) * sinD) / (Math.cos(toRad(lat)) * cosD);
  if (cosOmega < -1 || cosOmega > 1) return null;
  const omega = toDeg(Math.acos(cosOmega));
  const jSet = jTransit + omega / 360;
  const msFromJ2000 = (jSet - 2451545.0) * 86400000;
  return new Date(msFromJ2000 - (2451545.0 - 2440587.5) * 86400000);
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  return h > 0 ? `${h}:${pad(m)}` : `${pad(m)}m`;
}
