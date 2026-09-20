import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type LogSeverity = 'info' | 'warning' | 'danger';
export type LogKind = 'alarm' | 'event' | 'system';

export interface LogEntry {
  id: string;
  at: string;
  kind: LogKind;
  severity: LogSeverity;
  title: string;
  detail?: string;
}

type LogDraft = Omit<LogEntry, 'id' | 'at'> & {
  id?: string;
  at?: string;
};

interface LogStore {
  entries: LogEntry[];
  overlayOpen: boolean;
  openLog: () => void;
  closeLog: () => void;
  toggleLog: () => void;
  append: (entry: LogDraft) => void;
  clear: () => void;
}

const MAX_ENTRIES = 200;

function createEntry(entry: LogDraft): LogEntry {
  return {
    id: entry.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: entry.at ?? new Date().toISOString(),
    kind: entry.kind,
    severity: entry.severity,
    title: entry.title,
    detail: entry.detail,
  };
}

export const useLogStore = create<LogStore>()(
  persist(
    (set) => ({
      entries: [],
      overlayOpen: false,
      openLog: () => set({ overlayOpen: true }),
      closeLog: () => set({ overlayOpen: false }),
      toggleLog: () => set((state) => ({ overlayOpen: !state.overlayOpen })),
      append: (entry) =>
        set((state) => ({
          entries: [createEntry(entry), ...state.entries].slice(0, MAX_ENTRIES),
        })),
      clear: () => set({ entries: [] }),
    }),
    {
      name: 'helmui-event-log',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ entries: state.entries }),
    },
  ),
);
