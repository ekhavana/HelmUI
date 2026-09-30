import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Pencil, Plus, RotateCcw, X } from 'lucide-react';
import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useBoatStore } from '../../store/boatStore';
import {
  listPlacedTiles,
  TILE_CATALOG,
  type ColumnWidth,
  type DashboardScreenId,
} from '../../domain/dashboard/layout';
import { TILE_COMPONENTS } from './tileRegistry';

const COLUMN_TEMPLATE: Record<ColumnWidth, string> = {
  narrow: '20rem',
  wide: 'minmax(0, 1fr)',
  flex: 'minmax(0, 1fr)',
};

const LONG_PRESS_MS = 600;

function TileBody({ tileId }: { tileId: string }) {
  const Component = TILE_COMPONENTS[tileId];
  if (!Component) return null;
  return <Component />;
}

export function DashboardGrid({ screen }: { screen: DashboardScreenId }) {
  const layout = useBoatStore((state) => state.dashboards[screen]);
  const editMode = useBoatStore((state) => state.editMode);
  const setEditMode = useBoatStore((state) => state.setEditMode);
  const moveTile = useBoatStore((state) => state.moveTile);
  const removeTile = useBoatStore((state) => state.removeTile);
  const addTile = useBoatStore((state) => state.addTile);
  const resetDashboard = useBoatStore((state) => state.resetDashboard);

  const [pickerColumn, setPickerColumn] = useState<string | null>(null);
  const holdTimer = useRef<number | null>(null);

  const placed = new Set(listPlacedTiles(layout));
  const available = TILE_CATALOG.filter((tile) => !placed.has(tile.id));

  function clearHold() {
    if (holdTimer.current !== null) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }

  function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (editMode) return;
    // Long-pressing the chart should pan the map, not open edit mode.
    if ((event.target as HTMLElement).closest('.leaflet-container')) return;
    clearHold();
    holdTimer.current = window.setTimeout(() => setEditMode(true), LONG_PRESS_MS);
  }

  const gridTemplateColumns = layout.map((col) => COLUMN_TEMPLATE[col.width]).join(' ');

  return (
    <section
      className="relative grid min-h-0 flex-1 gap-4"
      style={{ gridTemplateColumns }}
      onPointerDown={onPointerDown}
      onPointerUp={clearHold}
      onPointerLeave={clearHold}
      onPointerCancel={clearHold}
      onPointerMove={clearHold}
    >
      {!editMode ? (
        <button
          aria-label="Edit dashboard"
          className="absolute right-0 top-0 z-[1100] flex items-center gap-1.5 rounded-full border border-slate-600/70 bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur transition hover:border-cyan-300/60 hover:text-cyan-100"
          onClick={() => setEditMode(true)}
          type="button"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
      ) : (
        <div className="absolute right-0 top-0 z-[1100] flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 rounded-full border border-slate-600/70 bg-slate-950/85 px-3 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur transition hover:text-slate-100"
            onClick={() => resetDashboard(screen)}
            type="button"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          <button
            className="flex items-center gap-1.5 rounded-full border border-cyan-300/60 bg-cyan-500/20 px-3 py-1.5 text-xs font-bold text-cyan-100 backdrop-blur transition hover:bg-cyan-500/30"
            onClick={() => setEditMode(false)}
            type="button"
          >
            <Check className="h-3.5 w-3.5" /> Done
          </button>
        </div>
      )}

      {layout.map((col) => (
        <div key={col.id} className="flex min-h-0 flex-col gap-4">
          {col.tiles.map((tileId) => {
            const isChart = tileId === 'chart';
            const wrapperClass = isChart ? 'relative min-h-[260px] flex-1' : 'relative shrink-0';
            return (
              <div key={tileId} className={wrapperClass}>
                {editMode ? (
                  <TileEditFrame
                    label={TILE_CATALOG.find((tile) => tile.id === tileId)?.label ?? tileId}
                    onMove={(direction) => moveTile(screen, tileId, direction)}
                    onRemove={() => removeTile(screen, tileId)}
                  />
                ) : null}
                <div className={`h-full ${editMode ? 'pointer-events-none opacity-95' : ''}`}>
                  <TileBody tileId={tileId} />
                </div>
              </div>
            );
          })}
          {editMode ? (
            <button
              className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-600/70 bg-slate-950/40 py-3 text-sm font-semibold text-slate-300 transition hover:border-cyan-300/60 hover:text-cyan-100"
              onClick={() => setPickerColumn(col.id)}
              type="button"
            >
              <Plus className="h-4 w-4" /> Add tile
            </button>
          ) : null}
        </div>
      ))}

      {pickerColumn ? (
        <TilePicker
          available={available}
          onClose={() => setPickerColumn(null)}
          onPick={(tileId) => {
            addTile(screen, pickerColumn, tileId);
            setPickerColumn(null);
          }}
        />
      ) : null}
    </section>
  );
}

function TileEditFrame({
  label,
  onMove,
  onRemove,
}: {
  label: string;
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onRemove: () => void;
}) {
  return (
    <div className="absolute inset-0 z-[1050] flex flex-col rounded-3xl border-2 border-dashed border-cyan-300/60 bg-slate-950/35">
      <div className="flex items-center justify-between gap-2 rounded-t-2xl bg-slate-950/85 px-3 py-1.5">
        <span className="truncate text-xs font-bold uppercase tracking-wide text-cyan-100">{label}</span>
        <div className="flex items-center gap-1">
          <MoveButton label="Move left" onClick={() => onMove('left')}><ArrowLeft className="h-4 w-4" /></MoveButton>
          <MoveButton label="Move up" onClick={() => onMove('up')}><ArrowUp className="h-4 w-4" /></MoveButton>
          <MoveButton label="Move down" onClick={() => onMove('down')}><ArrowDown className="h-4 w-4" /></MoveButton>
          <MoveButton label="Move right" onClick={() => onMove('right')}><ArrowRight className="h-4 w-4" /></MoveButton>
          <button
            aria-label="Remove tile"
            className="ml-1 rounded-lg bg-red-500/25 p-1 text-red-100 transition hover:bg-red-500/40"
            onClick={onRemove}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MoveButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="rounded-lg bg-slate-800/80 p-1 text-slate-100 transition hover:bg-cyan-500/30 hover:text-cyan-100"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function TilePicker({
  available,
  onClose,
  onPick,
}: {
  available: typeof TILE_CATALOG;
  onClose: () => void;
  onPick: (tileId: string) => void;
}) {
  return (
    <div className="absolute inset-0 z-[1200] flex items-center justify-center bg-slate-950/70 p-8" onClick={onClose}>
      <div
        className="max-h-full w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-600/70 bg-slate-900/95 p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-100">Add a tile</h3>
          <button
            aria-label="Close"
            className="rounded-lg bg-slate-800/80 p-1.5 text-slate-200 transition hover:bg-slate-700"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {available.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">Every tile is already on this screen.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {available.map((tile) => (
              <button
                className="flex flex-col items-start gap-1 rounded-2xl border border-slate-700/70 bg-slate-950/60 p-3 text-left transition hover:border-cyan-300/60 hover:bg-slate-900"
                key={tile.id}
                onClick={() => onPick(tile.id)}
                type="button"
              >
                <span className="text-sm font-bold text-slate-100">{tile.label}</span>
                {tile.hint ? <span className="text-xs text-slate-400">{tile.hint}</span> : null}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
