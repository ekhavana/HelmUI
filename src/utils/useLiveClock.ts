import { useEffect, useState } from 'react';
import { formatCountdown, getSunsetUTC } from './sun';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function localTimeString(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export interface LiveClock {
  local: string;
  sunsetCountdown: string;
}

export function useLiveClock(lat: number | null, lon: number | null): LiveClock {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const align = 60000 - (Date.now() % 60000);
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      setNow(new Date());
      interval = setInterval(() => setNow(new Date()), 60000);
    }, align);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const local = localTimeString(now);

  let sunsetCountdown = '--:--';
  if (lat !== null && lon !== null) {
    const sunset = getSunsetUTC(now, lat, lon);
    if (sunset) {
      const diff = sunset.getTime() - now.getTime();
      sunsetCountdown = diff > 0 ? formatCountdown(diff) : 'Set';
    }
  }

  return { local, sunsetCountdown };
}
