import L from 'leaflet';
import { Navigation, Ship } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useBoatStore } from '../../store/boatStore';
import { formatCardinal, formatDegrees, formatKts, formatNumber } from '../../utils/formatters';
import { useAisMarkers } from '../../utils/useAisMarkers';
import { useLeafletMap, vesselIcon } from '../../utils/useLeafletMap';
import { Card } from '../ui/Card';

export function ChartScreen() {
  const navigation = useBoatStore((state) => state.data.navigation);
  const speed = useBoatStore((state) => state.data.speed);
  const route = useBoatStore((state) => state.data.route);
  const ais = useBoatStore((state) => state.data.ais);

  const { containerRef: mapContainerRef, mapRef } = useLeafletMap({ zoom: 13, zoomControl: true });
  const markerRef = useRef<L.Marker | null>(null);
  useAisMarkers(mapRef, ais.contacts);

  const lat = navigation.latitude;
  const lon = navigation.longitude;
  const hasPosition = lat !== null && lon !== null;
  const contacts = useMemo(
    () =>
      Object.values(ais.contacts)
        .filter((contact) => contact.latitude !== null && contact.longitude !== null)
        .sort((a, b) => (a.rangeNm ?? Number.POSITIVE_INFINITY) - (b.rangeNm ?? Number.POSITIVE_INFINITY)),
    [ais.contacts],
  );

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
              <div className="text-xl text-white">{formatNumber(route.etaMinutes, 0)} min</div>
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
          <div className="mt-3 text-sm font-semibold text-slate-200">
            Closest {formatNumber(ais.closestNm)} nm · {ais.bearing}
            {ais.closestName ? ` · ${ais.closestName}` : ''}
          </div>
          <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-auto">
            {contacts.length === 0 ? (
              <div className="text-sm font-semibold text-slate-400">Waiting for AIS targets…</div>
            ) : (
              contacts.slice(0, 8).map((contact) => (
                <div key={contact.id} className="rounded-xl border border-slate-700/70 bg-slate-950/50 px-3 py-2 text-sm font-semibold text-slate-200">
                  <div className="flex items-center justify-between gap-2 text-white">
                    <span className="truncate">{contact.name ?? contact.mmsi}</span>
                    <span>{formatNumber(contact.rangeNm)} nm</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    {formatCardinal(contact.bearingDeg)} · {formatKts(contact.sogKts)}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card title="Guidance" eyebrow="Pilot">
          <div className="space-y-2 text-sm font-semibold text-slate-200">
            {route.crossTrackErrorNm != null ? (
              <div className="flex items-center gap-2"><Navigation className="h-4 w-4 text-cyan-200" /> XTE {formatNumber(route.crossTrackErrorNm, 2)} nm</div>
            ) : (
              <div className="flex items-center gap-2"><Navigation className="h-4 w-4 text-cyan-200" /> Waiting for route corridor</div>
            )}
            {ais.closestNm != null ? (
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${ais.riskLevel === 'danger' ? 'text-red-300' : ais.riskLevel === 'warning' ? 'text-amber-300' : 'text-cyan-300'}`}>▲</span>
                Closest contact {formatNumber(ais.closestNm)} nm {ais.bearing}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">▲</span> No AIS contacts yet
              </div>
            )}
          </div>
        </Card>
      </aside>
    </section>
  );
}
