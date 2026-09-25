import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyBoatData } from '../../data/boatData.ts';
import { evaluateAlarms } from './evaluateAlarms.ts';

const settings = {
  brightness: 82,
  theme: 'auto' as const,
  depthWarningFt: 6,
  depthOffsetFt: 0,
  autoLaunch: true,
  touchLock: false,
};

const healthySources = {
  signalk: { connected: true, lastSeen: new Date().toISOString() },
  mqtt: { connected: true, lastSeen: new Date().toISOString() },
  nodered: { connected: true, lastSeen: new Date().toISOString() },
};

test('evaluateAlarms uses displayed depth including offset', () => {
  const alarms = evaluateAlarms({
    data: {
      ...emptyBoatData,
      depth: { ...emptyBoatData.depth, belowTransducerFt: 4 },
    },
    settings: { ...settings, depthOffsetFt: -2 },
    sourceHealth: healthySources,
  });
  assert.ok(alarms.some((alarm) => alarm.id.startsWith('depth-')));
});

test('evaluateAlarms raises bilge flood', () => {
  const alarms = evaluateAlarms({
    data: {
      ...emptyBoatData,
      bilge: { ...emptyBoatData.bilge, alarm: true },
    },
    settings,
    sourceHealth: healthySources,
  });
  assert.ok(alarms.some((alarm) => alarm.id === 'bilge-flood'));
});

test('evaluateAlarms flags disconnected sources', () => {
  const alarms = evaluateAlarms({
    data: emptyBoatData,
    settings,
    sourceHealth: {
      ...healthySources,
      signalk: { connected: false, lastSeen: null },
    },
    activeSources: ['signalk'],
  });
  assert.ok(alarms.some((alarm) => alarm.id === 'source-down-signalk'));
});
