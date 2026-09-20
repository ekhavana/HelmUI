export interface AisContact {
  id: string;
  mmsi: string;
  name: string | null;
  latitude: number | null;
  longitude: number | null;
  sogKts: number | null;
  cogTrue: number | null;
  headingTrue: number | null;
  lastSeen: string;
  rangeNm: number | null;
  bearingDeg: number | null;
}

export type AisContacts = Record<string, AisContact>;
