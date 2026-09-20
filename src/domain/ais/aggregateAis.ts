import { formatCardinal } from '../../utils/formatters';
import { haversineMeters, initialBearingDeg } from '../../utils/geo';
import { getAisSafetyState } from '../../utils/thresholds';
import type { AisContact, AisContacts } from './types';

export const AIS_STALE_MS = 10 * 60 * 1000;

export interface AisSummary {
  riskLevel: 'safe' | 'warning' | 'danger';
  targets: number;
  closestNm: number | null;
  closestName: string | null;
  bearing: string;
  contacts: AisContacts;
}

export function mergeAisContacts(
  base: AisContacts,
  patch: Record<string, Partial<AisContact>> | undefined,
  now = Date.now(),
): AisContacts {
  const next: AisContacts = { ...base };

  for (const [id, update] of Object.entries(patch ?? {})) {
    const prev = next[id];
    next[id] = {
      id,
      mmsi: update.mmsi ?? prev?.mmsi ?? id,
      name: update.name !== undefined ? update.name : (prev?.name ?? null),
      latitude: update.latitude !== undefined ? update.latitude : (prev?.latitude ?? null),
      longitude: update.longitude !== undefined ? update.longitude : (prev?.longitude ?? null),
      sogKts: update.sogKts !== undefined ? update.sogKts : (prev?.sogKts ?? null),
      cogTrue: update.cogTrue !== undefined ? update.cogTrue : (prev?.cogTrue ?? null),
      headingTrue: update.headingTrue !== undefined ? update.headingTrue : (prev?.headingTrue ?? null),
      lastSeen: update.lastSeen ?? prev?.lastSeen ?? new Date(now).toISOString(),
      rangeNm: prev?.rangeNm ?? null,
      bearingDeg: prev?.bearingDeg ?? null,
    };
  }

  for (const [id, contact] of Object.entries(next)) {
    const age = now - Date.parse(contact.lastSeen);
    if (Number.isFinite(age) && age > AIS_STALE_MS) delete next[id];
  }

  return next;
}

export function summarizeAis(
  contacts: AisContacts,
  navigation: { latitude: number | null; longitude: number | null },
): AisSummary {
  const ownLat = navigation.latitude;
  const ownLon = navigation.longitude;
  let closestNm: number | null = null;
  let closestBearingDeg: number | null = null;
  let closestName: string | null = null;
  const enriched: AisContacts = {};

  for (const contact of Object.values(contacts)) {
    let rangeNm: number | null = null;
    let bearingDeg: number | null = null;
    if (ownLat !== null && ownLon !== null && contact.latitude !== null && contact.longitude !== null) {
      rangeNm = haversineMeters(ownLat, ownLon, contact.latitude, contact.longitude) / 1852;
      bearingDeg = initialBearingDeg(ownLat, ownLon, contact.latitude, contact.longitude);
      if (closestNm === null || rangeNm < closestNm) {
        closestNm = rangeNm;
        closestBearingDeg = bearingDeg;
        closestName = contact.name;
      }
    }
    enriched[contact.id] = { ...contact, rangeNm, bearingDeg };
  }

  const targets = Object.keys(enriched).length;
  return {
    contacts: enriched,
    targets,
    closestNm,
    closestName,
    bearing: formatCardinal(closestBearingDeg),
    riskLevel: closestNm === null ? 'safe' : getAisSafetyState(closestNm, targets),
  };
}
