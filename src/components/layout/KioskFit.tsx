import { useEffect, useState, type ReactNode } from 'react';

interface KioskFitProps {
  width?: number;
  height?: number;
  children: ReactNode;
}

// The helm layout is authored at a fixed kiosk resolution and scaled to fit the
// display. Without this the cards shrink below their content and clip readings.
export function KioskFit({ width = 1920, height = 1080, children }: KioskFitProps) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / width, window.innerHeight / height));
    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);
    return () => {
      window.removeEventListener('resize', fit);
      window.removeEventListener('orientationchange', fit);
    };
  }, [width, height]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-950">
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width,
          height,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
