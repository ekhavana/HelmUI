import L from 'leaflet';
import { useEffect, useRef, type RefObject } from 'react';
import type { AisContacts } from '../domain/ais/types';
import { formatCardinal, formatKts, formatNumber } from './formatters';
import { aisTargetIcon } from './useLeafletMap';

export function useAisMarkers(mapRef: RefObject<L.Map | null>, contacts: AisContacts) {
  const markersRef = useRef(new Map<string, L.Marker>());

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const seen = new Set<string>();
    for (const contact of Object.values(contacts)) {
      if (contact.latitude === null || contact.longitude === null) continue;
      seen.add(contact.id);
      const heading = contact.headingTrue ?? contact.cogTrue ?? 0;
      const icon = aisTargetIcon(heading);
      const label = [
        contact.name ?? contact.mmsi,
        contact.rangeNm != null ? `${formatNumber(contact.rangeNm)} nm` : null,
        contact.bearingDeg != null ? formatCardinal(contact.bearingDeg) : null,
        contact.sogKts != null ? formatKts(contact.sogKts) : null,
      ]
        .filter(Boolean)
        .join(' · ');

      const existing = markersRef.current.get(contact.id);
      if (existing) {
        existing.setLatLng([contact.latitude, contact.longitude]);
        existing.setIcon(icon);
        existing.setTooltipContent(label);
      } else {
        const marker = L.marker([contact.latitude, contact.longitude], { icon, zIndexOffset: 200 })
          .bindTooltip(label, { direction: 'top', offset: [0, -12], opacity: 0.95 })
          .addTo(map);
        markersRef.current.set(contact.id, marker);
      }
    }

    for (const [id, marker] of markersRef.current) {
      if (seen.has(id)) continue;
      marker.remove();
      markersRef.current.delete(id);
    }
  }, [contacts, mapRef]);

  useEffect(
    () => () => {
      for (const marker of markersRef.current.values()) marker.remove();
      markersRef.current.clear();
    },
    [],
  );
}
