import { Lock } from 'lucide-react';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { useBoatStore } from '../../store/boatStore';
import { useLogStore } from '../../store/logStore';

const HOLD_MS = 2000;

export function TouchLockOverlay() {
  const locked = useBoatStore((state) => state.settings.touchLock);
  const updateSettings = useBoatStore((state) => state.updateSettings);
  const append = useLogStore((state) => state.append);
  const [progress, setProgress] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const wasLockedRef = useRef(locked);

  useEffect(() => {
    if (locked && !wasLockedRef.current) {
      append({ kind: 'system', severity: 'info', title: 'Touch lock engaged' });
    }
    wasLockedRef.current = locked;
  }, [append, locked]);

  const stopHold = () => {
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    startRef.current = null;
    setProgress(0);
  };

  const tick = (now: number) => {
    if (startRef.current === null) startRef.current = now;
    const next = Math.min(1, (now - startRef.current) / HOLD_MS);
    setProgress(next);
    if (next >= 1) {
      stopHold();
      updateSettings({ touchLock: false });
      append({ kind: 'system', severity: 'info', title: 'Touch lock released' });
      return;
    }
    frameRef.current = window.requestAnimationFrame(tick);
  };

  const startHold = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    stopHold();
    frameRef.current = window.requestAnimationFrame(tick);
  };

  useEffect(() => () => stopHold(), []);

  if (!locked) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex touch-none flex-col items-center justify-center bg-slate-950/80 backdrop-blur-[2px]"
      onContextMenu={(event) => event.preventDefault()}
    >
      <Lock className="mb-4 h-16 w-16 text-amber-200" />
      <div className="text-sm font-bold uppercase tracking-[0.28em] text-amber-200">Touch Locked</div>
      <div className="mt-2 text-2xl font-semibold text-white">Helm controls are frozen</div>
      <button
        aria-label="Hold to unlock"
        className="relative mt-10 min-h-20 min-w-[320px] overflow-hidden rounded-2xl border border-amber-300/50 bg-slate-950/80 px-10 text-lg font-bold uppercase tracking-[0.18em] text-amber-100"
        onLostPointerCapture={stopHold}
        onPointerCancel={stopHold}
        onPointerDown={startHold}
        onPointerUp={stopHold}
        type="button"
      >
        <span
          className="absolute inset-y-0 left-0 bg-amber-400/25"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
        <span className="relative">Hold to unlock</span>
      </button>
    </div>
  );
}
