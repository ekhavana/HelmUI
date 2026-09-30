export function displayedDepthFt(belowTransducerFt: number | null, offsetFt: number): number | null {
  if (belowTransducerFt === null) return null;
  return belowTransducerFt + offsetFt;
}
