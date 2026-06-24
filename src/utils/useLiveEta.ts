function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function computeEta(distanceNm: number, sogKts: number): string {
  if (sogKts < 0.3 || distanceNm <= 0) return '--:--';
  const nowMs = Date.now();
  const hoursToGo = distanceNm / sogKts;
  const etaMs = nowMs + hoursToGo * 3600000;
  const eta = new Date(etaMs);
  return `${pad(eta.getHours())}:${pad(eta.getMinutes())}`;
}
