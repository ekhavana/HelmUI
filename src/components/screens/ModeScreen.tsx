import { Menu } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { AiAssistantScreen } from './AiAssistantScreen';
import { AnchorScreen } from './AnchorScreen';
import { ChartScreen } from './ChartScreen';
import { EngineScreen } from './EngineScreen';
import { HelmScreen } from './HelmScreen';
import { ModePlaceholder } from './ModePlaceholder';
import { SystemsScreen } from './SystemsScreen';

export function ModeScreen() {
  const mode = useBoatStore((state) => state.mode);

  if (mode === 'helm') return <HelmScreen />;

  if (mode === 'chart') return <ChartScreen />;

  if (mode === 'anchor') return <AnchorScreen />;

  if (mode === 'engine') return <EngineScreen />;

  if (mode === 'systems') return <SystemsScreen />;

  if (mode === 'ai') return <AiAssistantScreen />;

  return <ModePlaceholder title="Menu" eyebrow="HelmUI" icon={<Menu className="h-20 w-20" />} summary="Menu mode will hold brightness, night/day themes, data source configuration, kiosk settings, and vessel thresholds." items={['Display and brightness', 'Depth threshold settings', 'Signal K connection', 'Kiosk and PWA options']} />;
}
