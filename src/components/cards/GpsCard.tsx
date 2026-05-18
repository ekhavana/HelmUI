import { Satellite } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { Card } from '../ui/Card';

export function GpsCard() {
  const navigation = useBoatStore((state) => state.data.navigation);

  return (
    <Card className="h-full px-3 py-2 lg:px-5 lg:py-4" tone="safe">
      <div className="flex h-full items-center gap-2 lg:gap-3">
        <Satellite className="h-5 w-5 shrink-0 lg:h-8 lg:w-8" />
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-300 lg:text-sm">GPS</div>
          <div className="text-sm font-bold leading-tight text-white lg:mt-1 lg:text-3xl">{navigation.gpsFix}</div>
          <div className="text-[9px] leading-tight text-slate-300 lg:text-sm">{navigation.satellites} satellites</div>
        </div>
      </div>
    </Card>
  );
}
