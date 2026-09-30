// Pure dashboard layout model. Kept free of React so the move/add/remove rules
// and persistence sanitization can be unit-tested in isolation.

export type DashboardScreenId = 'helm' | 'engine' | 'systems';

export const DASHBOARD_SCREENS: DashboardScreenId[] = ['helm', 'engine', 'systems'];

export type ColumnWidth = 'narrow' | 'flex' | 'wide';

export interface DashboardColumn {
  id: string;
  width: ColumnWidth;
  tiles: string[];
}

export type DashboardLayout = DashboardColumn[];

export type TileMoveDirection = 'up' | 'down' | 'left' | 'right';

export interface TileCatalogEntry {
  id: string;
  label: string;
  // A one-line hint shown in the tile picker so operators know what they add.
  hint?: string;
  // Chart-style tiles want the wide center column; the picker uses this to
  // suggest a sensible destination.
  wide?: boolean;
}

// Every tile is just a card, so any tile may live on any editable screen. The
// catalog is the single source of truth for what can be placed and how it reads
// in the picker; the React render map keys off these ids.
export const TILE_CATALOG: TileCatalogEntry[] = [
  { id: 'speed', label: 'Speed', hint: 'SOG / STW' },
  { id: 'heading', label: 'Heading', hint: 'Compass heading' },
  { id: 'waterTemp', label: 'Water Temp', hint: 'Sea temperature' },
  { id: 'wind', label: 'Wind', hint: 'Apparent + true wind' },
  { id: 'battery', label: 'Battery', hint: 'House bank state' },
  { id: 'bilge', label: 'Bilge', hint: 'Flood sensor' },
  { id: 'engine', label: 'Engine Summary', hint: 'Coolant + RPM glance' },
  { id: 'gps', label: 'GPS', hint: 'Fix quality + satellites' },
  { id: 'depthSafety', label: 'Depth Safety', hint: 'Depth vs. warning' },
  { id: 'batterySafety', label: 'Battery Safety', hint: 'Low-voltage watch' },
  { id: 'aisRisk', label: 'AIS Risk', hint: 'Closest contact' },
  { id: 'autopilot', label: 'Autopilot', hint: 'Mode + target heading' },
  { id: 'chart', label: 'Chart', hint: 'Live map + AIS', wide: true },
  { id: 'engineRpm', label: 'Engine RPM', hint: 'Main engine RPM' },
  { id: 'engineFuel', label: 'Fuel', hint: 'Burn rate + tank' },
  { id: 'engineMonitor', label: 'Engine Monitor', hint: 'Coolant / oil / hours', wide: true },
  { id: 'enginePower', label: 'Alternator Power', hint: 'Charging output' },
  { id: 'engineRuntime', label: 'Engine Hours', hint: 'Lifetime hours' },
  { id: 'electrical', label: 'Electrical', hint: 'DC bus + solar', wide: true },
  { id: 'fluids', label: 'Fluid Systems', hint: 'Tanks + bilge', wide: true },
  { id: 'network', label: 'Network + Automation', hint: 'Source health', wide: true },
];

export const TILE_LABELS: Record<string, string> = Object.fromEntries(
  TILE_CATALOG.map((entry) => [entry.id, entry.label]),
);

const ALL_TILE_IDS = new Set(TILE_CATALOG.map((entry) => entry.id));

function column(id: string, width: ColumnWidth, tiles: string[]): DashboardColumn {
  return { id, width, tiles };
}

export function defaultDashboardLayout(screen: DashboardScreenId): DashboardLayout {
  switch (screen) {
    case 'helm':
      return [
        column('left', 'narrow', ['speed', 'heading', 'waterTemp']),
        column('center', 'wide', ['chart']),
        column('right', 'narrow', ['wind', 'battery', 'bilge', 'engine']),
      ];
    case 'engine':
      return [
        column('left', 'narrow', ['engineRpm', 'engineFuel']),
        column('center', 'wide', ['engineMonitor']),
        column('right', 'narrow', ['enginePower', 'engineRuntime']),
      ];
    case 'systems':
      return [
        column('a', 'flex', ['electrical']),
        column('b', 'flex', ['fluids']),
        column('c', 'flex', ['network']),
      ];
  }
}

export function listPlacedTiles(layout: DashboardLayout): string[] {
  return layout.flatMap((col) => col.tiles);
}

function cloneLayout(layout: DashboardLayout): DashboardLayout {
  return layout.map((col) => ({ ...col, tiles: [...col.tiles] }));
}

function locate(layout: DashboardLayout, tileId: string): { col: number; index: number } | null {
  for (let col = 0; col < layout.length; col += 1) {
    const index = layout[col].tiles.indexOf(tileId);
    if (index !== -1) return { col, index };
  }
  return null;
}

export function moveTileInLayout(
  layout: DashboardLayout,
  tileId: string,
  direction: TileMoveDirection,
): DashboardLayout {
  const found = locate(layout, tileId);
  if (!found) return layout;
  const next = cloneLayout(layout);
  const { col, index } = found;

  if (direction === 'up' || direction === 'down') {
    const target = direction === 'up' ? index - 1 : index + 1;
    const tiles = next[col].tiles;
    if (target < 0 || target >= tiles.length) return layout;
    [tiles[index], tiles[target]] = [tiles[target], tiles[index]];
    return next;
  }

  // Horizontal moves relocate the tile to the neighboring column, appended at
  // the bottom where it is easy to see it landed.
  const targetCol = direction === 'left' ? col - 1 : col + 1;
  if (targetCol < 0 || targetCol >= next.length) return layout;
  next[col].tiles.splice(index, 1);
  next[targetCol].tiles.push(tileId);
  return next;
}

export function removeTileFromLayout(layout: DashboardLayout, tileId: string): DashboardLayout {
  const found = locate(layout, tileId);
  if (!found) return layout;
  const next = cloneLayout(layout);
  next[found.col].tiles.splice(found.index, 1);
  return next;
}

export function addTileToLayout(
  layout: DashboardLayout,
  columnId: string,
  tileId: string,
): DashboardLayout {
  if (!ALL_TILE_IDS.has(tileId)) return layout;
  // Adding is also a move: strip any existing placement so a tile never appears
  // twice, then drop it into the requested column.
  const withoutTile = removeTileFromLayout(layout, tileId);
  const next = cloneLayout(withoutTile);
  const target = next.find((col) => col.id === columnId) ?? next[next.length - 1];
  if (!target) return layout;
  target.tiles.push(tileId);
  return next;
}

function isColumnWidth(value: unknown): value is ColumnWidth {
  return value === 'narrow' || value === 'flex' || value === 'wide';
}

// Persisted layouts may predate catalog changes or arrive corrupted, so we
// rebuild a valid layout: known columns keep their tiles, unknown/duplicate
// tiles are dropped, and anything unusable falls back to the screen default.
export function sanitizeLayout(screen: DashboardScreenId, layout: unknown): DashboardLayout {
  if (!Array.isArray(layout) || layout.length === 0) return defaultDashboardLayout(screen);
  const seen = new Set<string>();
  const columns: DashboardLayout = [];
  for (const raw of layout) {
    if (!raw || typeof raw !== 'object') continue;
    const candidate = raw as Partial<DashboardColumn>;
    if (typeof candidate.id !== 'string') continue;
    const width = isColumnWidth(candidate.width) ? candidate.width : 'flex';
    const tiles: string[] = [];
    if (Array.isArray(candidate.tiles)) {
      for (const tile of candidate.tiles) {
        if (typeof tile === 'string' && ALL_TILE_IDS.has(tile) && !seen.has(tile)) {
          seen.add(tile);
          tiles.push(tile);
        }
      }
    }
    columns.push({ id: candidate.id, width, tiles });
  }
  return columns.length > 0 ? columns : defaultDashboardLayout(screen);
}
