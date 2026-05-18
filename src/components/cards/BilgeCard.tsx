import { ShieldCheck, Siren } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { Card } from '../ui/Card';

export function BilgeCard() {
  const bilge = useBoatStore((state) => state.data.bilge);

  return (
    <Card title="Bilge" eyebrow="Flood" tone={bilge.alarm ? 'danger' : 'safe'}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-3xl font-bold text-white">{bilge.alarm ? 'Alarm' : 'All Clear'}</div>
          <div className="mt-1 text-base text-slate-300">{bilge.message}</div>
        </div>
        {bilge.alarm ? <Siren className="h-14 w-14 shrink-0" /> : <ShieldCheck className="h-14 w-14 shrink-0" />}
      </div>
    </Card>
  );
}
