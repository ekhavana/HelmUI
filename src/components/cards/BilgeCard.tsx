import { ShieldCheck, Siren } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { Card } from '../ui/Card';

export function BilgeCard() {
  const bilge = useBoatStore((state) => state.data.bilge);

  return (
    <Card title="Bilge" eyebrow="Flood" tone={bilge.alarm ? 'danger' : 'safe'}>
      <div className="flex items-center justify-between gap-2 xl:gap-4">
        <div>
          <div className="text-base font-bold leading-tight text-white xl:text-3xl">{bilge.alarm ? 'Alarm' : 'All Clear'}</div>
          <div className="mt-0.5 text-[10px] text-slate-300 xl:mt-1 xl:text-base">{bilge.message}</div>
        </div>
        {bilge.alarm ? <Siren className="h-7 w-7 shrink-0 xl:h-14 xl:w-14" /> : <ShieldCheck className="h-7 w-7 shrink-0 xl:h-14 xl:w-14" />}
      </div>
    </Card>
  );
}
