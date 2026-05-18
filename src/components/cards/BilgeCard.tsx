import { ShieldCheck, Siren } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { Card } from '../ui/Card';

export function BilgeCard() {
  const bilge = useBoatStore((state) => state.data.bilge);

  return (
    <Card title="Bilge" eyebrow="Flood" tone={bilge.alarm ? 'danger' : 'safe'}>
      <div className="flex items-center justify-between gap-2 lg:gap-4">
        <div>
          <div className="text-sm font-bold leading-tight text-white lg:text-3xl">{bilge.alarm ? 'Alarm' : 'All Clear'}</div>
          <div className="text-[9px] leading-tight text-slate-300 lg:mt-1 lg:text-base">{bilge.message}</div>
        </div>
        {bilge.alarm ? <Siren className="h-6 w-6 shrink-0 lg:h-14 lg:w-14" /> : <ShieldCheck className="h-6 w-6 shrink-0 lg:h-14 lg:w-14" />}
      </div>
    </Card>
  );
}
