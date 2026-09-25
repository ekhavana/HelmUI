import test from 'node:test';
import assert from 'node:assert/strict';
import { AIS_STALE_MS, mergeAisContacts, summarizeAis } from './aggregateAis.ts';

test('mergeAisContacts drops stale targets', () => {
  const now = Date.parse('2026-09-24T12:00:00.000Z');
  const contacts = mergeAisContacts(
    {
      stale: {
        id: 'stale',
        mmsi: 'stale',
        name: 'OLD',
        latitude: 38.9,
        longitude: -76.5,
        sogKts: 1,
        cogTrue: 0,
        headingTrue: 0,
        lastSeen: new Date(now - AIS_STALE_MS - 1).toISOString(),
        rangeNm: 1,
        bearingDeg: 0,
      },
    },
    {
      live: {
        mmsi: '366123456',
        name: 'PILOT BOAT',
        latitude: 38.984,
        longitude: -76.4922,
        lastSeen: new Date(now).toISOString(),
      },
    },
    now,
  );

  assert.equal(contacts.stale, undefined);
  assert.equal(contacts.live.name, 'PILOT BOAT');
});

test('summarizeAis reports closest northbound target', () => {
  const summary = summarizeAis(
    {
      '366123456': {
        id: '366123456',
        mmsi: '366123456',
        name: 'PILOT BOAT',
        latitude: 38.984,
        longitude: -76.4922,
        sogKts: 6,
        cogTrue: 180,
        headingTrue: 180,
        lastSeen: '2026-09-24T00:00:00.000Z',
        rangeNm: null,
        bearingDeg: null,
      },
    },
    { latitude: 38.9784, longitude: -76.4922 },
  );

  assert.equal(summary.targets, 1);
  assert.equal(summary.closestName, 'PILOT BOAT');
  assert.equal(summary.bearing, 'N');
  assert.ok(summary.closestNm !== null && summary.closestNm > 0.3 && summary.closestNm < 0.5);
  assert.equal(summary.riskLevel, 'danger');
});
