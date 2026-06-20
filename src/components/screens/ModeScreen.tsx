import { useBoatStore } from '../../store/boatStore';
import { AiAssistantScreen } from './AiAssistantScreen';
import { AnchorScreen } from './AnchorScreen';
import { ChartScreen } from './ChartScreen';
import { EngineScreen } from './EngineScreen';
import { HelmScreen } from './HelmScreen';
import { MenuScreen } from './MenuScreen';
import { SystemsScreen } from './SystemsScreen';

export function ModeScreen() {
  const mode = useBoatStore((state) => state.mode);

  if (mode === 'helm') return <HelmScreen />;

  if (mode === 'chart') return <ChartScreen />;

  if (mode === 'anchor') return <AnchorScreen />;

  if (mode === 'engine') return <EngineScreen />;

  if (mode === 'systems') return <SystemsScreen />;

  if (mode === 'ai') return <AiAssistantScreen />;

  return <MenuScreen />;
}
