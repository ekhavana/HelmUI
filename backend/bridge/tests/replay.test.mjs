import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { applyReplayEvent, playReplayFile } from '../replay.mjs';

const fixtureUrl = new URL('../fixtures/bench-pass.json', import.meta.url);

test('applyReplayEvent maps Signal K AIS and own-ship depth', () => {
  const applied = applyReplayEvent({
    signalk: {
      context: 'vessels.urn:mrn:imo:mmsi:366123456',
      updates: [
        {
          values: [
            { path: 'name', value: 'PILOT BOAT' },
            { path: 'navigation.position', value: { latitude: 38.984, longitude: -76.4922 } },
          ],
        },
      ],
    },
  });

  assert.deepEqual(applied.sources, ['signalk']);
  assert.equal(applied.patch.ais.contacts['366123456'].name, 'PILOT BOAT');
  assert.equal(applied.patch.navigation, undefined);
});

test('applyReplayEvent maps MQTT brightness onto ui', () => {
  const applied = applyReplayEvent({
    mqtt: { topic: 'helmui/kiosk/brightness', payload: '78' },
  });
  assert.ok(applied.sources.includes('mqtt'));
  assert.equal(applied.ui.brightness, 78);
});

test('bench-pass fixture produces AIS, autopilot, depth, and bilge patches', async () => {
  const fixture = JSON.parse(await readFile(fixtureUrl, 'utf8'));
  const merged = {};
  let brightness;

  for (const event of fixture.events) {
    const applied = applyReplayEvent(event);
    Object.assign(merged, applied.patch);
    if (applied.ui?.brightness !== undefined) brightness = applied.ui.brightness;
  }

  assert.equal(brightness, 78);
  assert.equal(merged.autopilot.state, 'auto');
  assert.equal(merged.ais.contacts['366123456'].name, 'PILOT BOAT');
  assert.ok(Date.now() - Date.parse(merged.ais.contacts['366123456'].lastSeen) < 5000);
  assert.equal(merged.navigation.latitude, 38.9784);
  assert.equal(merged.bilge.alarm, false);
  assert.ok(merged.depth.belowTransducerFt > 13);
});

test('playReplayFile emits events in order without looping', async () => {
  const seen = [];
  await playReplayFile(
    fileURLToPath(fixtureUrl),
    {
      onEvent: (applied) => {
        seen.push(applied);
      },
    },
    { loop: false },
  );

  assert.equal(seen.length, 7);
  assert.equal(seen[1].ui.brightness, 78);
  assert.equal(seen[3].patch.ais.contacts['366123456'].name, 'PILOT BOAT');
  assert.equal(seen[5].patch.bilge.alarm, true);
});
