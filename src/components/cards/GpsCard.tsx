import { Satellite } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { Card } from '../ui/Card';

export function GpsCard() {
  const navigation = useBoatStore((state) => state.data.navigation);

  return (
    <Card className="h-full px-5 py-4" tone="safe">
      <div className="flex items-center gap-3">
        <Satellite className="h-8 w-8" />
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-slate-300">GPS</div>
          <div className="mt-1 text-3xl font-bold text-white">{navigation.gpsFix}</div>
          <div className="text-sm text-slate-300">{navigation.satellites} satellites</div>
        </div>
      </div>
    </Card>
  );
}
