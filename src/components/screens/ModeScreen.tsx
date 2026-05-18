import { Anchor, Bot, Gauge, Map, Menu, Wrench } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { HelmScreen } from './HelmScreen';
import { ModePlaceholder } from './ModePlaceholder';

export function ModeScreen() {
  const mode = useBoatStore((state) => state.mode);

  if (mode === 'helm') return <HelmScreen />;

  if (mode === 'chart') {
    return <ModePlaceholder title="Chart" eyebrow="Navigation" icon={<Map className="h-20 w-20" />} summary="A dedicated charting workspace for future OpenCPN, AvNav, OpenLayers, or tile-source integration." items={['Chart source selector', 'Route and waypoint panel', 'AIS target overlay', 'Range and orientation controls']} />;
  }

  if (mode === 'anchor') {
    return <ModePlaceholder title="Anchor" eyebrow="Watch" icon={<Anchor className="h-20 w-20" />} summary="Anchor watch mode will prioritize swing radius, GPS confidence, depth trend, wind, and alarm acknowledgement." items={['Swing radius guard', 'Anchor position lock', 'Depth and wind watch', 'Alarm escalation']} />;
  }

  if (mode === 'engine') {
    return <ModePlaceholder title="Engine" eyebrow="Propulsion" icon={<Gauge className="h-20 w-20" />} summary="Engine mode will group propulsion telemetry, charging status, thermal limits, and maintenance-relevant indicators." items={['Coolant and alternator detail', 'Runtime and service log', 'Temperature alarms', 'Charging diagnostics']} />;
  }

  if (mode === 'systems') {
    return <ModePlaceholder title="Systems" eyebrow="Vessel" icon={<Wrench className="h-20 w-20" />} summary="Systems mode will collect electrical, bilge, sensors, Node-RED automation states, MQTT devices, and health checks." items={['Electrical distribution', 'Sensor node health', 'Automation states', 'Network and data sources']} />;
  }

  if (mode === 'ai') {
    return <ModePlaceholder title="AI Assistant" eyebrow="Optional" icon={<Bot className="h-20 w-20" />} summary="The assistant remains optional and separate, with space reserved for future docked guidance that never blocks core helm data." items={['Offline-safe assistant shell', 'Context handoff controls', 'Voice/text entry placeholder', 'Safety disclaimer area']} />;
  }

  return <ModePlaceholder title="Menu" eyebrow="HelmUI" icon={<Menu className="h-20 w-20" />} summary="Menu mode will hold brightness, night/day themes, data source configuration, kiosk settings, and vessel thresholds." items={['Display and brightness', 'Depth threshold settings', 'Signal K connection', 'Kiosk and PWA options']} />;
}
