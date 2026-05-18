import { Anchor, Bot, Compass, Gauge, Map, Menu, ShipWheel, Wrench } from 'lucide-react';
import { IconButton } from '../ui/IconButton';

export function BottomNav() {
  return (
    <nav className="flex h-24 items-center justify-between gap-3 rounded-[2rem] border border-slate-700/70 bg-slate-950/55 p-3 backdrop-blur-md">
      <IconButton icon={<ShipWheel />} label="Helm" active />
      <IconButton icon={<Map />} label="Chart" />
      <IconButton icon={<Anchor />} label="Anchor" />
      <IconButton icon={<Gauge />} label="Engine" />
      <IconButton icon={<Wrench />} label="Systems" />
      <IconButton icon={<Bot />} label="AI Assistant" />
      <IconButton icon={<Menu />} label="Menu" />
    </nav>
  );
}
