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

test('normalizeSignalKDelta maps autopilot state and target heading', () => {
  const input = {
    updates: [
      {
        values: [
          { path: 'steering.autopilot.mode', value: 'AUTO' },
          { path: 'steering.autopilot.target.headingTrue', value: Math.PI },
        ],
      },
    ],
  };

  const patch = normalizeSignalKDelta(input);
  assert.equal(patch.autopilot.state, 'auto');
  assert.equal(Math.round(patch.autopilot.headingTarget), 180);
});

test('normalizeSignalKDelta ignores non-finite autopilot heading values', () => {
  const patch = normalizeSignalKDelta({
    updates: [{ values: [{ path: 'steering.autopilot.target.headingTrue', value: 'not-a-number' }] }],
  });
  assert.equal(patch.autopilot, undefined);
});

test('normalizeSignalKDelta maps other vessels into AIS contacts', () => {
  const patch = normalizeSignalKDelta(
    {
      context: 'vessels.urn:mrn:imo:mmsi:366123456',
      updates: [
        {
          timestamp: '2026-09-20T08:00:00.000Z',
          values: [
            { path: 'navigation.position', value: { latitude: 40.71, longitude: -74.01 } },
            { path: 'navigation.speedOverGround', value: 5 },
            { path: 'name', value: 'PILOT BOAT' },
          ],
        },
      ],
    },
    { selfContext: 'vessels.urn:mrn:signalk:uuid:own' },
  );

  const contact = patch.ais.contacts['366123456'];
  assert.equal(contact.name, 'PILOT BOAT');
  assert.equal(contact.latitude, 40.71);
  assert.equal(Math.round(contact.sogKts), 10);
  assert.equal(patch.navigation, undefined);
});

test('normalizeSignalKDelta keeps own-ship position off the AIS list', () => {
  const patch = normalizeSignalKDelta(
    {
      context: 'vessels.urn:mrn:signalk:uuid:own',
      updates: [{ values: [{ path: 'navigation.position', value: { latitude: 41.1, longitude: -73.2 } }] }],
    },
    { selfContext: 'vessels.urn:mrn:signalk:uuid:own' },
  );

  assert.equal(patch.navigation.latitude, 41.1);
  assert.equal(patch.ais, undefined);
});

test('defaultSourceState initializes all bridge inputs as disconnected', () => {
  const state = defaultSourceState();
  assert.equal(state.signalk.connected, false);
  assert.equal(state.mqtt.connected, false);
  assert.equal(state.nodered.connected, false);
});
