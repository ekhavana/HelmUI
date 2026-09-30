import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addTileToLayout,
  defaultDashboardLayout,
  listPlacedTiles,
  moveTileInLayout,
  removeTileFromLayout,
  sanitizeLayout,
} from './layout.ts';

test('default helm layout keeps the chart in the wide center column', () => {
  const layout = defaultDashboardLayout('helm');
  const center = layout.find((col) => col.id === 'center');
  assert.ok(center);
  assert.equal(center?.width, 'wide');
  assert.deepEqual(center?.tiles, ['chart']);
});

test('moving a tile up swaps it with the tile above in the same column', () => {
  const layout = defaultDashboardLayout('helm');
  const next = moveTileInLayout(layout, 'heading', 'up');
  const left = next.find((col) => col.id === 'left');
  assert.deepEqual(left?.tiles, ['heading', 'speed', 'waterTemp']);
});

test('moving a tile at the top edge is a no-op', () => {
  const layout = defaultDashboardLayout('helm');
  const next = moveTileInLayout(layout, 'speed', 'up');
  assert.equal(next, layout);
});

test('moving right relocates the tile to the neighboring column', () => {
  const layout = defaultDashboardLayout('helm');
  const next = moveTileInLayout(layout, 'waterTemp', 'right');
  const left = next.find((col) => col.id === 'left');
  const center = next.find((col) => col.id === 'center');
  assert.deepEqual(left?.tiles, ['speed', 'heading']);
  assert.deepEqual(center?.tiles, ['chart', 'waterTemp']);
});

test('removing a tile drops it from the layout', () => {
  const layout = defaultDashboardLayout('helm');
  const next = removeTileFromLayout(layout, 'bilge');
  assert.equal(listPlacedTiles(next).includes('bilge'), false);
});

test('adding a tile that already exists moves it rather than duplicating', () => {
  const layout = defaultDashboardLayout('helm');
  const next = addTileToLayout(layout, 'left', 'battery');
  const occurrences = listPlacedTiles(next).filter((id) => id === 'battery');
  assert.equal(occurrences.length, 1);
  assert.equal(next.find((col) => col.id === 'left')?.tiles.includes('battery'), true);
});

test('adding an unknown tile id is ignored', () => {
  const layout = defaultDashboardLayout('helm');
  const next = addTileToLayout(layout, 'left', 'not-a-tile');
  assert.equal(next, layout);
});

test('sanitizeLayout drops unknown and duplicate tiles', () => {
  const dirty = [
    { id: 'left', width: 'narrow', tiles: ['speed', 'speed', 'ghost'] },
    { id: 'center', width: 'wide', tiles: ['chart'] },
  ];
  const clean = sanitizeLayout('helm', dirty);
  assert.deepEqual(clean[0].tiles, ['speed']);
  assert.deepEqual(clean[1].tiles, ['chart']);
});

test('sanitizeLayout falls back to defaults for garbage input', () => {
  assert.deepEqual(sanitizeLayout('systems', null), defaultDashboardLayout('systems'));
  assert.deepEqual(sanitizeLayout('systems', []), defaultDashboardLayout('systems'));
});
