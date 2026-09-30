import { BookOpen, X } from 'lucide-react';
import { useLogStore } from '../../store/logStore';

function formatLogTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--:--';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const severityClass: Record<string, string> = {
  danger: 'border-red-400/50 bg-red-950/30 text-red-100',
  warning: 'border-amber-400/45 bg-amber-950/25 text-amber-100',
  info: 'border-slate-600/70 bg-slate-950/55 text-slate-100',
};

export function EventLogOverlay() {
  const open = useLogStore((state) => state.overlayOpen);
  const entries = useLogStore((state) => state.entries);
  const closeLog = useLogStore((state) => state.closeLog);
  const clear = useLogStore((state) => state.clear);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[1400] flex flex-col bg-slate-950/95 p-6 backdrop-blur-md">
      <header className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-cyan-100">
          <BookOpen className="h-7 w-7" />
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Alarm / Event Log</div>
            <h2 className="text-3xl font-bold text-white">{entries.length} entries</h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="min-h-12 rounded-xl border border-slate-600 bg-slate-900/70 px-5 text-sm font-semibold text-slate-200"
            onClick={clear}
            type="button"
          >
            Clear
          </button>
          <button
            className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-cyan-300/40 bg-cyan-500/15 px-5 text-sm font-semibold text-cyan-100"
            onClick={closeLog}
            type="button"
          >
            <X className="h-5 w-5" /> Close
          </button>
        </div>
      </header>
      <div className="min-h-0 flex-1 space-y-2 overflow-auto pr-1">
        {entries.length === 0 ? (
          <div className="flex h-full items-center justify-center text-lg font-semibold text-slate-400">
            No alarms or events recorded yet.
          </div>
        ) : (
          entries.map((entry) => (
            <article key={entry.id} className={`rounded-2xl border px-4 py-3 ${severityClass[entry.severity]}`}>
              <div className="flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.18em] opacity-80">
                <span>{entry.kind}</span>
                <span>{formatLogTime(entry.at)}</span>
              </div>
              <div className="mt-1 text-lg font-semibold">{entry.title}</div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
