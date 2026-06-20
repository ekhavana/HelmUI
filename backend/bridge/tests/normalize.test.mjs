import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultSourceState, normalizeSignalKDelta } from '../normalize.mjs';

test('normalizeSignalKDelta maps key navigation values', () => {
  const input = {
    updates: [
      {
        values: [
          { path: 'navigation.speedOverGround', value: 5 },
          { path: 'navigation.headingTrue', value: Math.PI / 2 },
          { path: 'navigation.gnss.satellites', value: 11.4 },
        ],
      },
    ],
  };

  const patch = normalizeSignalKDelta(input);
  assert.ok(patch.speed);
  assert.ok(patch.navigation);
  assert.equal(Math.round(patch.speed.sogKts), 10);
  assert.equal(Math.round(patch.navigation.headingTrue), 90);
  assert.equal(patch.navigation.satellites, 11);
});

test('defaultSourceState initializes all bridge inputs as disconnected', () => {
  const state = defaultSourceState();
  assert.equal(state.signalk.connected, false);
  assert.equal(state.mqtt.connected, false);
  assert.equal(state.nodered.connected, false);
});
