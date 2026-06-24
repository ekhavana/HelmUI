import type { ReactNode } from 'react';

interface KioskFitProps {
  width?: number;
  height?: number;
  children: ReactNode;
}

export function KioskFit({ children }: KioskFitProps) {
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ width: '100dvw', height: '100dvh' }}>
      {children}
    </div>
  );
}
