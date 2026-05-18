import { useEffect, useState, type ReactNode } from 'react';

interface KioskFitProps {
  width?: number;
  height?: number;
  children: ReactNode;
}

export function KioskFit({ width = 1920, height = 1080, children }: KioskFitProps) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const compute = () => {
      setScale(Math.min(window.innerWidth / width, window.innerHeight / height));
    };

    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [width, height]);

  return (
    <div className="fixed inset-0 grid place-items-center overflow-hidden">
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {children}
      </div>
    </div>
  );
}
