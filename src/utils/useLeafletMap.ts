import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { runtimeConfig } from '../config/runtime';

export interface LeafletMapOptions {
  zoom?: number;
  zoomControl?: boolean;
}

export function useLeafletMap(options: LeafletMapOptions = {}) {
  const { zoom = 13, zoomControl = false } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [0, 0],
      zoom,
      zoomControl,
      attributionControl: false,
    });

    const { offlineOnly, tileUrlTemplate } = runtimeConfig.chart;
    const baseTemplate =
      tileUrlTemplate || (offlineOnly ? '/tiles/base.svg' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

    L.tileLayer(baseTemplate, {
      maxZoom: 19,
      opacity: 0.85,
    }).addTo(map);

    if (!offlineOnly) {
      L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
        maxZoom: 18,
        opacity: 0.9,
      }).addTo(map);
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return { containerRef, mapRef };
}

export function vesselIcon(headingDeg: number, size = 40): L.DivIcon {
  const half = size / 2;
  const tip = Math.round(size * 0.4);
  const base = Math.round(size * 0.25);
  const notch = Math.round(size * 0.15);
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="-${half} -${half} ${size} ${size}">
      <g transform="rotate(${headingDeg})">
        <polygon points="0,-${tip} ${base},${Math.round(size * 0.25)} 0,${notch} -${base},${Math.round(size * 0.25)}"
          fill="rgba(34,211,238,0.95)" stroke="rgba(255,255,255,0.8)" stroke-width="1.5"/>
      </g>
    </svg>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [half, half],
  });
}

export function aisTargetIcon(headingDeg: number, size = 28): L.DivIcon {
  const half = size / 2;
  const tip = Math.round(size * 0.4);
  const base = Math.round(size * 0.22);
  const notch = Math.round(size * 0.14);
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="-${half} -${half} ${size} ${size}">
      <g transform="rotate(${headingDeg})">
        <polygon points="0,-${tip} ${base},${Math.round(size * 0.25)} 0,${notch} -${base},${Math.round(size * 0.25)}"
          fill="rgba(251,146,60,0.95)" stroke="rgba(255,255,255,0.85)" stroke-width="1.4"/>
      </g>
    </svg>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [half, half],
  });
}

export function anchorIcon(): L.DivIcon {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="rgba(250,204,21,1)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/>
      <path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
    </svg>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}
