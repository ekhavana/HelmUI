import L from 'leaflet';
import { Ship, SkipForward } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { runtimeConfig } from '../../config/runtime';
import { useBoatStore } from '../../store/boatStore';
import { formatCardinal, formatDegrees, formatKts, formatNumber } from '../../utils/formatters';
import { useAisMarkers } from '../../utils/useAisMarkers';
import { useLeafletMap, vesselIcon } from '../../utils/useLeafletMap';
import { buildActiveRoute } from '../../domain/route/activeRoute';
import { AutopilotControl } from '../autopilot/AutopilotControl';
import { Card } from '../ui/Card';

export function ChartScreen() {
  const navigation = useBoatStore((state) => state.data.navigation);
  const speed = useBoatStore((state) => state.data.speed);
  const route = useBoatStore((state) => state.data.route);
  const ais = useBoatStore((state) => state.data.ais);
  const telemetryMode = useBoatStore((state) => state.telemetryMode);
  const controlPending = useBoatStore((state) => state.autopilotControl.pending);
  const sendCommand = useBoatStore((state) => state.sendAutopilotCommand);
  const [advanceConfirm, setAdvanceConfirm] = useState(false);

  const { containerRef: mapContainerRef, mapRef } = useLeafletMap({ zoom: 13, zoomControl: true });
  const markerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  useAisMarkers(mapRef, ais.contacts);

  const lat = navigation.latitude;
  const lon = navigation.longitude;
  const hasPosition = lat !== null && lon !== null;
  const hasRoute = route.nextWaypointLat !== null && route.nextWaypointLon !== null;
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

  // Draw the active route leg, course-to-steer, and waypoint markers.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!routeLayerRef.current) {
      routeLayerRef.current = L.layerGroup().addTo(map);
    }
    const group = routeLayerRef.current;
    group.clearLayers();

    const geometry = buildActiveRoute({
      vessel: hasPosition ? { latitude: lat, longitude: lon } : null,
      nextWaypoint:
        route.nextWaypointLat !== null && route.nextWaypointLon !== null
          ? { latitude: route.nextWaypointLat, longitude: route.nextWaypointLon }
          : null,
      previousWaypoint:
        route.previousWaypointLat !== null && route.previousWaypointLon !== null
          ? { latitude: route.previousWaypointLat, longitude: route.previousWaypointLon }
          : null,
    });
    if (!geometry) return;

    for (const [from, to] of geometry.legs) {
      L.polyline(
        [
          [from.latitude, from.longitude],
          [to.latitude, to.longitude],
        ],
        { color: '#22d3ee', weight: 3, opacity: 0.9 },
      ).addTo(group);
    }
    if (geometry.courseToSteer) {
      const [from, to] = geometry.courseToSteer;
      L.polyline(
        [
          [from.latitude, from.longitude],
          [to.latitude, to.longitude],
        ],
        { color: '#38bdf8', weight: 2, opacity: 0.8, dashArray: '6 8' },
      ).addTo(group);
    }
    if (geometry.previousWaypoint) {
      L.circleMarker([geometry.previousWaypoint.latitude, geometry.previousWaypoint.longitude], {
        radius: 4,
        color: '#94a3b8',
        weight: 2,
        fillColor: '#0f172a',
        fillOpacity: 1,
      }).addTo(group);
    }
    if (geometry.nextWaypoint) {
      L.circleMarker([geometry.nextWaypoint.latitude, geometry.nextWaypoint.longitude], {
        radius: 7,
        color: '#ffffff',
        weight: 2,
        fillColor: '#06b6d4',
        fillOpacity: 1,
      })
        .bindTooltip(route.nextWaypoint && route.nextWaypoint !== '—' ? route.nextWaypoint : 'Next waypoint', {
          permanent: false,
          direction: 'top',
        })
        .addTo(group);
    }

    return () => {
      group.clearLayers();
    };
  }, [
    mapRef,
    hasPosition,
    lat,
    lon,
    route.nextWaypointLat,
    route.nextWaypointLon,
    route.previousWaypointLat,
    route.previousWaypointLon,
    route.nextWaypoint,
  ]);

  const advanceDisabled = telemetryMode === 'replay' || controlPending || !hasRoute;

  return (
    <section className="grid min-h-0 flex-1 grid-cols-[340px_minmax(0,1fr)_360px] gap-4">
      <aside className="flex min-h-0 flex-col gap-4 overflow-y-auto pr-1">
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
            <div>
              <div className="text-slate-400">Bearing</div>
              <div className="text-xl text-white">{formatDegrees(route.bearingToWaypointDeg)}</div>
            </div>
            <div>
              <div className="text-slate-400">XTE</div>
              <div className="text-xl text-cyan-100">{formatNumber(route.crossTrackErrorNm, 2)} nm</div>
            </div>
          </div>
          {advanceConfirm ? (
            <div className="mt-3 rounded-xl border border-amber-400/60 bg-amber-950/30 px-3 py-2">
              <div className="text-xs font-semibold text-amber-100">Advance to next waypoint?</div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    void sendCommand({ kind: 'advanceWaypoint' });
                    setAdvanceConfirm(false);
                  }}
                  className="flex-1 rounded-lg border border-amber-300 bg-amber-500/25 px-3 py-1.5 text-sm font-bold text-amber-100"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setAdvanceConfirm(false)}
                  className="flex-1 rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-1.5 text-sm font-bold text-slate-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={advanceDisabled}
              onClick={() => setAdvanceConfirm(true)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/50 bg-cyan-500/15 px-3 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <SkipForward className="h-4 w-4" /> Advance waypoint
            </button>
          )}
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
          <div className="pointer-events-none absolute inset-0 z-[1100] flex items-center justify-center">
            <div className="rounded-2xl border border-cyan-300/30 bg-slate-950/80 px-6 py-3 text-sm font-semibold text-cyan-200">
              Waiting for GPS fix…
            </div>
          </div>
        )}
        <div className="map-chip pointer-events-none absolute right-4 top-4 z-[1100] flex items-center gap-2">
          <div className="text-xs uppercase tracking-widest text-slate-300">Live Chart</div>
          <span className="text-slate-400">·</span>
          <div className="text-sm font-semibold">{runtimeConfig.chart.label}</div>
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
              contacts.slice(0, 6).map((contact) => (
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
        <AutopilotControl />
      </aside>
    </section>
  );
}
