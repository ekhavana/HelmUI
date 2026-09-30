import L from 'leaflet';
import { Navigation, Ship } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useBoatStore } from '../../store/boatStore';
import { formatDegrees, formatNumber } from '../../utils/formatters';
import { useAisMarkers } from '../../utils/useAisMarkers';
import { useLeafletMap, vesselIcon } from '../../utils/useLeafletMap';

export function ChartPanel() {
  const navigation = useBoatStore((state) => state.data.navigation);
  const ais = useBoatStore((state) => state.data.ais);
  const route = useBoatStore((state) => state.data.route);

  const { containerRef: mapContainerRef, mapRef } = useLeafletMap({ zoom: 13 });
  const markerRef = useRef<L.Marker | null>(null);
  useAisMarkers(mapRef, ais.contacts);

  const lat = navigation.latitude;
  const lon = navigation.longitude;
  const hasPosition = lat !== null && lon !== null;

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!hasPosition) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    const icon = vesselIcon(navigation.headingTrue ?? 0);
    if (markerRef.current) {
      markerRef.current.setIcon(icon);
      markerRef.current.setLatLng([lat, lon]);
    } else {
      markerRef.current = L.marker([lat, lon], { icon }).addTo(map);
    }

    map.setView([lat, lon], map.getZoom(), { animate: true });

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
    };
  }, [lat, lon, navigation.headingTrue, hasPosition, mapRef]);

  return (
    <section className="relative h-full overflow-hidden rounded-[2rem] border border-cyan-300/25">
      <div ref={mapContainerRef} className="absolute inset-0" />

      {!hasPosition && (
        <div className="pointer-events-none absolute inset-0 z-[1100] flex items-center justify-center">
          <div className="rounded-2xl border border-cyan-300/30 bg-slate-950/80 px-6 py-3 text-sm font-semibold text-cyan-200">
            Waiting for GPS fix…
          </div>
        </div>
      )}

      <div className="map-chip pointer-events-none absolute left-5 top-5 z-[1100] flex items-center gap-2">
        <div className="text-xs uppercase tracking-widest text-slate-300">HDG</div>
        <div className="text-base font-bold">{formatDegrees(navigation.headingTrue)}</div>
        <span className="text-slate-400">·</span>
        <div className="text-xs uppercase tracking-widest text-slate-300">COG</div>
        <div className="text-base font-bold">{formatDegrees(navigation.cogTrue)}</div>
      </div>

      <div className="map-chip pointer-events-none absolute bottom-5 left-5 z-[1100] flex items-center gap-2">
        <Navigation className="h-4 w-4 text-cyan-300" />
        <div className="text-sm font-semibold">{formatNumber(route.distanceNm)} nm · {route.nextWaypoint}</div>
      </div>

      <div className="map-chip pointer-events-none absolute bottom-5 right-5 z-[1100] flex items-center gap-2">
        <Ship className="h-4 w-4 text-cyan-300" />
        <div className="text-sm font-semibold">AIS {ais.targets} · {formatNumber(ais.closestNm)} nm</div>
      </div>
    </section>
  );
}
