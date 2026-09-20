import { ShieldCheck, Siren } from 'lucide-react';
import { useBoatStore } from '../../store/boatStore';
import { Card } from '../ui/Card';

export function BilgeCard() {
  const bilge = useBoatStore((state) => state.data.bilge);

  return (
    <Card title="Bilge" eyebrow="Flood" tone={bilge.alarm === true ? 'danger' : bilge.alarm === false ? 'safe' : 'default'}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-2xl font-bold leading-tight text-white">{bilge.alarm === true ? 'Alarm' : bilge.alarm === false ? 'All Clear' : 'No Data'}</div>
          <div className="mt-0.5 text-sm text-slate-300">{bilge.message}</div>
        </div>
        {bilge.alarm ? <Siren className="h-10 w-10 shrink-0" /> : <ShieldCheck className="h-10 w-10 shrink-0" />}
      </div>
    </Card>
  );
}
