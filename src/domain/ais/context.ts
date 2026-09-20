export function isOwnVesselContext(context: string | undefined, selfContext = 'vessels.self'): boolean {
  if (!context || context === 'vessels.self') return true;
  return context === selfContext;
}

export function vesselIdFromContext(context: string): string {
  const mmsi = context.match(/mmsi[:.](\d+)/i);
  if (mmsi) return mmsi[1];
  return context.replace(/^vessels\./, '');
}
