import L from 'leaflet';
import { Anchor, BellRing, Wind } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useBoatStore } from '../../store/boatStore';
import { formatFeet, formatNumber } from '../../utils/formatters';
import { anchorIcon, useLeafletMap, vesselIcon } from '../../utils/useLeafletMap';
import { Card } from '../ui/Card';

export function AnchorScreen() {
  const anchor = useBoatStore((state) => state.data.anchor);
  const navigation = useBoatStore((state) => state.data.navigation);
  const depth = useBoatStore((state) => state.data.depth.belowTransducerFt);
  const wind = useBoatStore((state) => state.data.wind);
  const setAnchorPosition = useBoatStore((state) => state.setAnchorPosition);
  const clearAnchorPosition = useBoatStore((state) => state.clearAnchorPosition);

  const { containerRef: mapContainerRef, mapRef } = useLeafletMap({ zoom: 16, zoomControl: true });
  const vesselMarkerRef = useRef<L.Marker | null>(null);
  const anchorMarkerRef = useRef<L.Marker | null>(null);
  const swingCircleRef = useRef<L.Circle | null>(null);

  const vesselLat = navigation.latitude;
  const vesselLon = navigation.longitude;
  const anchorLat = anchor.anchorLat;
  const anchorLon = anchor.anchorLon;
  const hasVessel = vesselLat !== null && vesselLon !== null;
  const hasAnchor = anchorLat !== null && anchorLon !== null;

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (hasVessel) {
      const icon = vesselIcon(navigation.headingTrue, 32);
      if (vesselMarkerRef.current) {
        vesselMarkerRef.current.setLatLng([vesselLat!, vesselLon!]);
        vesselMarkerRef.current.setIcon(icon);
      } else {
        vesselMarkerRef.current = L.marker([vesselLat!, vesselLon!], { icon }).addTo(map);
      }
    } else {
      vesselMarkerRef.current?.remove();
      vesselMarkerRef.current = null;
    }

    if (hasAnchor) {
      if (anchorMarkerRef.current) {
        anchorMarkerRef.current.setLatLng([anchorLat!, anchorLon!]);
      } else {
        anchorMarkerRef.current = L.marker([anchorLat!, anchorLon!], { icon: anchorIcon() }).addTo(map);
      }

      if (swingCircleRef.current) {
        swingCircleRef.current.setLatLng([anchorLat!, anchorLon!]);
        swingCircleRef.current.setRadius(anchor.radiusMeters);
      } else {
        swingCircleRef.current = L.circle([anchorLat!, anchorLon!], {
          radius: anchor.radiusMeters,
          color: 'rgba(250,204,21,0.8)',
          weight: 2,
          fillColor: 'rgba(250,204,21,0.06)',
          fillOpacity: 1,
        }).addTo(map);
      }

      map.setView([anchorLat!, anchorLon!], map.getZoom(), { animate: true });
    } else {
      anchorMarkerRef.current?.remove();
      anchorMarkerRef.current = null;
      swingCircleRef.current?.remove();
      swingCircleRef.current = null;
    }
  }, [hasVessel, vesselLat, vesselLon, navigation.headingTrue, hasAnchor, anchorLat, anchorLon, anchor.radiusMeters]);

  function handleSetAnchor() {
    if (vesselLat !== null && vesselLon !== null) {
      setAnchorPosition(vesselLat, vesselLon);
    }
  }

  return (
    <section className="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)_360px] gap-4">
      <aside className="flex min-h-0 flex-col gap-4">
        <Card title="Anchor State" eyebrow="Watch" tone={anchor.deployed ? 'active' : 'default'}>
          <div className="text-3xl font-bold text-white">{anchor.deployed ? 'Set' : 'Not Deployed'}</div>
          <div className="mt-3 space-y-2 text-sm font-semibold text-slate-200">
            <div>Rode: <span className="text-white">{formatNumber(anchor.rodeMeters)} m</span></div>
            <div>Scope: <span className="text-white">{formatNumber(anchor.scopeRatio, 1)} : 1</span></div>
            <div>Depth: <span className="text-white">{formatFeet(depth)}</span></div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={!hasVessel || anchor.deployed}
              onClick={handleSetAnchor}
              className="flex-1 rounded-xl border border-amber-300/40 bg-amber-400/10 py-2 text-sm font-bold text-amber-200 disabled:opacity-40"
            >
              <Anchor className="mr-1.5 inline h-4 w-4" />Set Anchor
            </button>
            <button
              type="button"
              disabled={!anchor.deployed}
              onClick={clearAnchorPosition}
              className="flex-1 rounded-xl border border-slate-500/40 bg-slate-700/30 py-2 text-sm font-bold text-slate-300 disabled:opacity-40"
            >
              Weigh
            </button>
          </div>
        </Card>
        <Card title="Wind + Drift" eyebrow="Context">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{formatNumber(wind.twsKts)} kt</div>
              <div className="text-sm text-slate-300">True wind speed</div>
            </div>
            <Wind className="h-10 w-10 text-cyan-200/80" />
          </div>
          <div className="mt-3 text-sm font-semibold text-slate-300">Drift from set: {formatNumber(anchor.distanceFromSetMeters)} m</div>
        </Card>
      </aside>

      <div className="relative min-h-0 overflow-hidden rounded-[2rem] border border-cyan-300/20">
        <div ref={mapContainerRef} className="absolute inset-0" />
        {!hasVessel && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div className="rounded-2xl border border-cyan-300/30 bg-slate-950/80 px-6 py-3 text-sm font-semibold text-cyan-200">
              Waiting for GPS fix…
            </div>
          </div>
        )}
        <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-xl border border-cyan-300/30 bg-slate-950/75 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-400">
          Anchor Watch · Swing {formatNumber(anchor.radiusMeters)} m
        </div>
      </div>

      <aside className="flex min-h-0 flex-col gap-4">
        <Card title="Watch Limits" eyebrow="Alarm" tone={anchor.distanceFromSetMeters > anchor.radiusMeters * 0.8 ? 'warning' : 'safe'}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.18em] text-slate-400">Radius</div>
              <div className="text-3xl font-bold text-white">{formatNumber(anchor.radiusMeters)} m</div>
            </div>
            <BellRing className="h-9 w-9 text-cyan-200/80" />
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-300">Alarm {anchor.alarmArmed ? 'armed' : 'disarmed'}</div>
        </Card>
        <Card title="Recommendations" eyebrow="Safety">
          <ul className="space-y-2 text-sm font-semibold text-slate-200">
            <li>Confirm GPS lock before sleep cycle.</li>
            <li>Set high-wind alarm at 22 kt.</li>
            <li>Re-check bearings if drift exceeds 75% of radius.</li>
          </ul>
        </Card>
      </aside>
    </section>
  );
}
