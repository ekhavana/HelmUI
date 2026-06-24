import L from 'leaflet';
import { Navigation, Ship } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useBoatStore } from '../../store/boatStore';
import { formatDegrees, formatKts, formatNumber } from '../../utils/formatters';
import { useLeafletMap, vesselIcon } from '../../utils/useLeafletMap';
import { Card } from '../ui/Card';

const DEFAULT_LAT = 40.7128;
const DEFAULT_LON = -74.006;

export function ChartScreen() {
  const navigation = useBoatStore((state) => state.data.navigation);
  const speed = useBoatStore((state) => state.data.speed);
  const route = useBoatStore((state) => state.data.route);
  const ais = useBoatStore((state) => state.data.ais);

  const { containerRef: mapContainerRef, mapRef } = useLeafletMap({ zoom: 13, zoomControl: true });
  const markerRef = useRef<L.Marker | null>(null);

  const lat = navigation.latitude ?? DEFAULT_LAT;
  const lon = navigation.longitude ?? DEFAULT_LON;
  const hasPosition = navigation.latitude !== null && navigation.longitude !== null;

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const icon = vesselIcon(navigation.headingTrue);
    if (markerRef.current) {
      markerRef.current.setIcon(icon);
      markerRef.current.setLatLng([lat, lon]);
    } else {
      markerRef.current = L.marker([lat, lon], { icon }).addTo(map);
    }

    if (hasPosition) {
      map.setView([lat, lon], map.getZoom(), { animate: true });
    }

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
    };
  }, [lat, lon, navigation.headingTrue, hasPosition]);

  return (
    <section className="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)_360px] gap-4">
      <aside className="flex min-h-0 flex-col gap-4">
        <Card title="Route" eyebrow="Navigator" tone="active">
          <div className="text-3xl font-bold text-white">{route.nextWaypoint}</div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm font-semibold text-slate-200">
            <div>
              <div className="text-slate-400">Distance</div>
              <div className="text-xl text-white">{formatNumber(route.distanceNm)} nm</div>
            </div>
            <div>
              <div className="text-slate-400">ETA</div>
              <div className="text-xl text-white">{route.etaMinutes} min</div>
            </div>
          </div>
          <div className="mt-3 text-sm font-semibold text-cyan-100">XTE {formatNumber(route.crossTrackErrorNm, 2)} nm</div>
        </Card>
        <Card title="Vessel" eyebrow="Motion">
          <div className="space-y-3 text-base font-semibold text-slate-200">
            <div className="flex items-center justify-between"><span>Heading</span><span className="text-white">{formatDegrees(navigation.headingTrue)}</span></div>
            <div className="flex items-center justify-between"><span>COG</span><span className="text-white">{formatDegrees(navigation.cogTrue)}</span></div>
            <div className="flex items-center justify-between"><span>SOG</span><span className="text-white">{formatKts(speed.sogKts)}</span></div>
            <div className="flex items-center justify-between"><span>STW</span><span className="text-white">{formatKts(speed.stwKts)}</span></div>
          </div>
        </Card>
      </aside>

      <div className="relative min-h-0 overflow-hidden rounded-[2rem] border border-cyan-300/20">
        <div ref={mapContainerRef} className="absolute inset-0" />
        {!hasPosition && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div className="rounded-2xl border border-cyan-300/30 bg-slate-950/80 px-6 py-3 text-sm font-semibold text-cyan-200">
              Waiting for GPS fix…
            </div>
          </div>
        )}
        <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2 rounded-xl border border-cyan-300/30 bg-slate-950/75 px-3 py-2 text-cyan-100">
          <div className="text-xs uppercase tracking-widest text-slate-400">Live Chart</div>
          <span className="text-slate-500">·</span>
          <div className="text-sm font-semibold">OSM + OpenSeaMap</div>
        </div>
      </div>

      <aside className="flex min-h-0 flex-col gap-4">
        <Card title="AIS Contacts" eyebrow="Traffic" tone={ais.riskLevel === 'danger' ? 'danger' : ais.riskLevel === 'warning' ? 'warning' : 'safe'}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold text-white">{ais.targets}</div>
              <div className="text-sm text-slate-300">targets nearby</div>
            </div>
            <Ship className="h-12 w-12 text-cyan-200/85" />
          </div>
          <div className="mt-3 text-sm font-semibold text-slate-200">Closest {formatNumber(ais.closestNm)} nm · {ais.bearing}</div>
        </Card>
        <Card title="Guidance" eyebrow="Pilot">
          <div className="space-y-2 text-sm font-semibold text-slate-200">
            <div className="flex items-center gap-2"><Navigation className="h-4 w-4 text-cyan-200" /> Keep waypoint corridor centered</div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-300">▲</span> Monitor crossing traffic starboard side
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-300">▲</span> Current heading aligns with route plan
            </div>
          </div>
        </Card>
      </aside>
    </section>
  );
}
