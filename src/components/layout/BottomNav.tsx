import type { ReactNode } from 'react';
import { Anchor, Bot, Gauge, Map, Menu, ShipWheel, Wrench } from 'lucide-react';
import { useBoatStore, type AppMode } from '../../store/boatStore';
import { IconButton } from '../ui/IconButton';

const navItems: Array<{ mode: AppMode; label: string; icon: ReactNode }> = [
  { mode: 'helm', label: 'Helm', icon: <ShipWheel /> },
  { mode: 'chart', label: 'Chart', icon: <Map /> },
  { mode: 'anchor', label: 'Anchor', icon: <Anchor /> },
  { mode: 'engine', label: 'Engine', icon: <Gauge /> },
  { mode: 'systems', label: 'Systems', icon: <Wrench /> },
  { mode: 'ai', label: 'AI Assistant', icon: <Bot /> },
  { mode: 'menu', label: 'Menu', icon: <Menu /> },
];

export function BottomNav() {
  const mode = useBoatStore((state) => state.mode);
  const setMode = useBoatStore((state) => state.setMode);

  return (
    <nav className="flex h-24 items-center justify-between gap-3 rounded-[2rem] border border-slate-700/70 bg-slate-950/55 p-3 backdrop-blur-md">
      {navItems.map((item) => (
        <IconButton key={item.mode} icon={item.icon} label={item.label} active={mode === item.mode} onClick={() => setMode(item.mode)} />
      ))}
    </nav>
  );
}
